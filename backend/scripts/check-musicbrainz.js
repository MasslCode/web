// Optional live, read-only smoke check. Pass a deployed music API URL to check
// that service instead of starting a local one. Never connects to the collection DB.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createMusicBrainzClient } from '../servers/musicbrainz/client.js';
import { createMusicBrainzService } from '../servers/musicbrainz/service.js';
import { createMusicApp } from '../servers/musicbrainz/app.js';
import axios from 'axios';

const upstreamRequests = [];
const deployedBase = process.argv[2]?.replace(/\/$/, '');
const app = createMusicApp(createMusicBrainzService(createMusicBrainzClient({
  async get(url, options) {
    const started = performance.now();
    const response = await axios.get(url, options);
    upstreamRequests.push({ path: new URL(url).pathname, ms: Math.round(performance.now() - started),
      releases: response.data.releases?.length });
    return response;
  },
})));
const server = deployedBase ? null : app.listen(0, '127.0.0.1');
if (server) await once(server, 'listening');
try {
  const base = deployedBase || `http://127.0.0.1:${server.address().port}`;
  const request = (path) => fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
  const health = await request('/health');
  assert.equal(health.status, 200, 'Music API health check failed');
  assert.equal((await health.json()).provider, 'musicbrainz',
    'This service is still running the old music API. Deploy the MusicBrainz backend before the frontend.');
  const search = await request('/api/search-albums?query=Radiohead%20OK%20Computer&limit=5');
  assert.equal(search.status, 200, JSON.stringify(await search.clone().json()));
  const albums = await search.json();
  const album = albums.find((item) => item.title === 'OK Computer' && item.artist === 'Radiohead');
  assert.ok(album, 'Expected Radiohead / OK Computer in search results');
  const started = performance.now();
  const response = await request(`/api/fetch-songs?albumId=${album.id}`);
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  const songs = await response.json();
  assert.ok(songs.length >= 12);
  assert.ok(songs.some((song) => song.title === 'Paranoid Android'));
  assert.ok(songs.every((song) => typeof song.id === 'string' && song.id.length <= 50));
  assert.ok(songs.every((song) => Number.isFinite(song.duration_in_sec) && song.duration_in_sec > 0),
    'Expected durations in seconds for every track on OK Computer');
  const totalDurationSeconds = songs.reduce((total, song) => total + song.duration_in_sec, 0);
  const coldTrackMs = Math.round(performance.now() - started);
  const warmStarted = performance.now();
  const warmResponse = await request(`/api/fetch-songs?albumId=${album.id}`);
  assert.deepEqual(await warmResponse.json(), songs);
  const warmTrackMs = Math.round(performance.now() - warmStarted);
  const coverMetrics = await Promise.allSettled([album.cover_thumbnail, album.cover_image].map(async (url) => {
    const image = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000, maxContentLength: 2 * 1024 * 1024 });
    assert.match(image.headers['content-type'], /^image\//);
    return { url, bytes: image.data.length };
  }));
  console.log(JSON.stringify({ title: album.title, artist: album.artist, year: album.release_year,
    trackCount: songs.length, totalDurationSeconds, firstTrack: songs[0], coldTrackMs,
    warmTrackMs, upstreamRequests, covers: coverMetrics.map((result) => result.status === 'fulfilled'
      ? result.value : { unavailable: result.reason.code || result.reason.message }) }, null, 2));
} catch (error) {
  console.error(`Music API check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
}
