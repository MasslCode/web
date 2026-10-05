// Optional live, read-only smoke check. Does not connect to the collection DB.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createMusicBrainzClient } from '../servers/musicbrainz/client.js';
import { createMusicBrainzService } from '../servers/musicbrainz/service.js';
import { createMusicApp } from '../servers/musicbrainz/app.js';
import axios from 'axios';

const upstreamRequests = [];
const app = createMusicApp(createMusicBrainzService(createMusicBrainzClient({
  async get(url, options) {
    const started = performance.now();
    const response = await axios.get(url, options);
    upstreamRequests.push({ path: new URL(url).pathname, ms: Math.round(performance.now() - started),
      releases: response.data.releases?.length });
    return response;
  },
})));
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const search = await fetch(`${base}/api/search-albums?query=Radiohead%20OK%20Computer&limit=5`);
  assert.equal(search.status, 200, JSON.stringify(await search.clone().json()));
  const albums = await search.json();
  const album = albums.find((item) => item.title === 'OK Computer' && item.artist === 'Radiohead');
  assert.ok(album, 'Expected Radiohead / OK Computer in search results');
  const started = performance.now();
  const response = await fetch(`${base}/api/fetch-songs?albumId=${album.id}`);
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  const songs = await response.json();
  assert.ok(songs.length >= 12);
  assert.ok(songs.some((song) => song.title === 'Paranoid Android'));
  assert.ok(songs.every((song) => typeof song.id === 'string' && song.id.length <= 50));
  const coldTrackMs = Math.round(performance.now() - started);
  const warmStarted = performance.now();
  const warmResponse = await fetch(`${base}/api/fetch-songs?albumId=${album.id}`);
  assert.deepEqual(await warmResponse.json(), songs);
  const warmTrackMs = Math.round(performance.now() - warmStarted);
  const coverMetrics = await Promise.allSettled([album.cover_thumbnail, album.cover_image].map(async (url) => {
    const image = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000, maxContentLength: 2 * 1024 * 1024 });
    assert.match(image.headers['content-type'], /^image\//);
    return { url, bytes: image.data.length };
  }));
  console.log(JSON.stringify({ title: album.title, artist: album.artist, year: album.release_year,
    trackCount: songs.length, firstTrack: songs[0], coldTrackMs,
    warmTrackMs, upstreamRequests, covers: coverMetrics.map((result) => result.status === 'fulfilled'
      ? result.value : { unavailable: result.reason.code || result.reason.message }) }, null, 2));
} finally {
  await new Promise((resolve) => server.close(resolve));
}
