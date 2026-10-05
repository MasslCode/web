import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createMusicBrainzClient } from '../servers/musicbrainz/client.js';
import { buildSearchQuery, createMusicBrainzService, formatAlbum, formatSongs } from '../servers/musicbrainz/service.js';
import { createMusicApp } from '../servers/musicbrainz/app.js';
import { saveAlbum } from '../servers/saveAlbum.js';

const groupId = 'b1392450-e666-3926-a536-22c65f834433';
const earlyRelease = '11111111-1111-4111-8111-111111111111';
const lateRelease = '22222222-2222-4222-8222-222222222222';
const trackId = '33333333-3333-4333-8333-333333333333';

test('search treats user terms as text and searches both title and artist', () => {
  const query = buildSearchQuery('Radiohead OK Computer');
  assert.match(query, /releasegroup:"Radiohead" OR artist:"Radiohead"/);
  assert.match(query, /primarytype:album OR primarytype:ep/);
  assert.ok(buildSearchQuery('a"\\ OR status:bootleg').includes('"a\\"\\\\"'));
  assert.ok(buildSearchQuery('a"\\ OR status:bootleg').includes('artist:"status:bootleg"'));
});

test('albums preserve credited artists, UUIDs and missing years', () => {
  const album = formatAlbum({ id: groupId, title: 'Test', 'primary-type': 'EP',
    'artist-credit': [{ name: 'A', joinphrase: ' feat. ' }, { artist: { name: 'B' } }],
    'first-release-date': '2001' });
  assert.equal(album.id, groupId);
  assert.equal(album.artist, 'A feat. B');
  assert.equal(album.release_year, 2001);
  assert.equal(album.type, 'EP');
  assert.equal(album.cover_image, `https://coverartarchive.org/release-group/${groupId}/front-500`);
  assert.equal(album.cover_thumbnail, `https://coverartarchive.org/release-group/${groupId}/front-250`);
  assert.equal(formatAlbum({ id: groupId }).release_year, null);
});

test('multi-disc tracklists keep occurrences distinct and convert milliseconds', () => {
  const release = { id: earlyRelease, media: [
    { position: 2, tracks: [{ position: 1, recording: { id: 'same-recording', title: 'Second disc' } }] },
    { position: 1, tracks: [
      { id: trackId, position: 2, title: 'Track title', length: 123456, recording: { title: 'Recording title' } },
      { position: 1, recording: { id: 'same-recording', title: 'First disc', length: 60000 } },
    ] },
  ] };
  const songs = formatSongs(release, groupId);
  assert.deepEqual(songs.map((song) => song.track_number), [1, 2, 3]);
  assert.deepEqual(songs.map((song) => song.duration_in_sec), [60, 123, null]);
  assert.deepEqual(songs.map((song) => song.title), ['First disc', 'Track title', 'Second disc']);
  assert.equal(songs[1].id, trackId);
  assert.equal(new Set(songs.map((song) => song.id)).size, 3);
  assert.ok(songs.every((song) => song.id.length <= 50));
  assert.deepEqual(formatSongs(release, groupId), songs);
});

test('release resolution pages through editions, selects the earliest, and skips incomplete tracklists', async () => {
  const calls = [];
  const service = createMusicBrainzService({ async request(path, params) {
    calls.push({ path, params });
    if (path === 'release' && params.offset === 0) return {
      'release-count': 2, releases: [{ id: lateRelease, date: '2001', media: [{ 'track-count': 1 }] }],
    };
    if (path === 'release') return {
      'release-count': 2, releases: [{ id: earlyRelease, date: '1999', media: [{ 'track-count': 10 }] }],
    };
    if (path === `release/${earlyRelease}`) return { id: earlyRelease, media: [
      { position: 1, 'track-count': 10, tracks: [{ id: trackId, position: 1, title: 'Incomplete' }] },
    ] };
    return { id: lateRelease, media: [{ position: 1, tracks: [{ id: trackId, position: 1, title: 'Song' }] }] };
  } });
  const songs = await service.fetchSongs(groupId);
  assert.equal(calls[0].params.status, 'official');
  assert.equal(calls[1].params.offset, 1);
  assert.equal(calls[2].path, `release/${earlyRelease}`);
  assert.equal(songs[0].title, 'Song');
});

test('albums without official editions fall back to other releases; missing tracks are explicit', async () => {
  const statuses = [];
  const service = createMusicBrainzService({ async request(_path, params) {
    statuses.push(params.status);
    return { 'release-count': 0, releases: [] };
  } });
  await assert.rejects(service.fetchSongs(groupId), { status: 404 });
  assert.deepEqual(statuses, ['official', undefined]);
});

test('concurrent track callers share resolution and a completed cache avoids all edition requests', async () => {
  let time = 0;
  let calls = 0;
  const service = createMusicBrainzService({ async request(path, params) {
    calls++;
    if (path === `release/${earlyRelease}`) return { id: earlyRelease, media: [
      { position: 1, 'track-count': 1, tracks: [{ id: trackId, title: 'Song', position: 1, length: 123000 }] },
    ] };
    assert.equal(path, 'release');
    assert.equal(params.inc, 'media');
    return { 'release-count': 1, releases: [{ id: earlyRelease, date: '1999', media: [
      { position: 1, 'track-count': 1 },
    ] }] };
  } }, { now: () => time, cacheTTL: 1000 });
  const [songs, sameSongs] = await Promise.all([service.fetchSongs(groupId), service.fetchSongs(groupId)]);
  assert.deepEqual(songs, sameSongs);
  assert.equal(calls, 2);
  assert.equal(songs[0].duration_in_sec, 123);
  time = 500;
  assert.deepEqual(await service.fetchSongs(groupId), songs);
  assert.equal(calls, 2);
  time = 1001;
  await service.fetchSongs(groupId);
  assert.equal(calls, 4);
});

test('tracklist failures are not cached and can be retried', async () => {
  let calls = 0;
  const service = createMusicBrainzService({ async request(path) {
    if (++calls === 1) throw new Error('Temporary failure');
    if (path === `release/${earlyRelease}`) return { id: earlyRelease, media: [
      { position: 1, 'track-count': 1, tracks: [{ id: trackId, title: 'Song', position: 1 }] },
    ] };
    return { 'release-count': 1, releases: [{ id: earlyRelease, date: '1999', media: [
      { position: 1, 'track-count': 1 },
    ] }] };
  } });
  await assert.rejects(service.fetchSongs(groupId), /Temporary failure/);
  assert.equal((await service.fetchSongs(groupId))[0].title, 'Song');
  assert.equal(calls, 3);
});

test('client throttles concurrent requests, retries, coalesces and expires cached data', async () => {
  let time = 0;
  const requests = [];
  let failures = 1;
  const client = createMusicBrainzClient({ now: () => time, sleep: async (ms) => { time += ms; },
    cacheTTL: 5000, async get(url, options) {
      requests.push({ time, url, options });
      if (url.endsWith('/retry') && failures > 0) {
        failures--;
        const error = new Error('Busy');
        error.response = { status: 503, headers: { 'retry-after': '3' } };
        throw error;
      }
      return { data: { url } };
    },
  });
  const [a, duplicate] = await Promise.all([
    client.request('a'), client.request('a'), client.request('b'),
  ]);
  assert.deepEqual(a, duplicate);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].time - requests[0].time, 1100);
  assert.match(requests[0].options.headers['User-Agent'], /AlbumReviewApp\/1.0/);
  assert.equal(requests[0].options.params.fmt, 'json');
  await client.request('retry');
  assert.equal(requests[3].time - requests[2].time, 3000);
  await client.request('retry');
  assert.equal(requests.length, 4);
  time += 5001;
  await client.request('retry');
  assert.equal(requests.length, 5);
});

test('client limits retries, clears failed requests and allows later recovery', async () => {
  let time = 0;
  let calls = 0;
  let failing = true;
  const client = createMusicBrainzClient({ now: () => time, sleep: async (ms) => { time += ms; },
    async get() {
      calls++;
      if (!failing) return { data: 'Recovered' };
      const error = new Error('Busy');
      error.response = { status: 429 };
      throw error;
    },
  });
  await assert.rejects(client.request('a'));
  assert.equal(calls, 3);
  failing = false;
  assert.equal(await client.request('a'), 'Recovered');
});

test('throttling pauses other queued requests as well as the retry', async () => {
  let time = 0;
  let failed = false;
  const times = [];
  const client = createMusicBrainzClient({ now: () => time, sleep: async (ms) => { time += ms; },
    async get(url) {
      times.push(time);
      if (url.endsWith('/a') && !failed) {
        failed = true;
        const error = new Error('Busy');
        error.response = { status: 503, headers: { 'retry-after': '3' } };
        throw error;
      }
      return { data: url };
    },
  });
  await Promise.all([client.request('a'), client.request('b')]);
  assert.deepEqual(times, [0, 3000, 4100]);
});

test('HTTP routes validate inputs and return useful upstream errors', async (t) => {
  const calls = [];
  const app = createMusicApp({
    async searchAlbums(query, limit) { calls.push({ query, limit }); return [formatAlbum({ id: groupId, title: query })]; },
    async fetchSongs() { const error = new Error('Busy'); error.response = { status: 503 }; throw error; },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const url of ['/api/search-albums', '/api/search-albums?query=x&limit=-1',
    '/api/search-albums?query=x&limit=101', '/api/search-albums?query=x&limit=abc',
    '/api/search-albums?query=x&query=y', '/api/fetch-songs?albumId=123']) {
    assert.equal((await fetch(base + url)).status, 400, url);
  }
  assert.equal(calls.length, 0);
  const search = await fetch(`${base}/api/search-albums?query=${encodeURIComponent('AC/DC & Friends')}&limit=5`);
  assert.equal(search.status, 200);
  assert.deepEqual(calls, [{ query: 'AC/DC & Friends', limit: 5 }]);
  assert.equal((await search.json())[0].id, groupId);
  const tracks = await fetch(`${base}/api/fetch-songs?albumId=${groupId}`);
  assert.equal(tracks.status, 503);
  assert.equal(tracks.headers.get('retry-after'), '5');
  assert.equal((await tracks.json()).retryAfter, 5);
});

test('saving passes string IDs and seconds to storage and commits together', async () => {
  const queries = [];
  let released = false;
  const client = { async query(sql, values) { queries.push({ sql, values }); }, release() { released = true; } };
  await saveAlbum({ connect: async () => client }, {
    id: groupId, title: 'Album', artist: 'Artist', release_year: null, average_rating: 8, cover_image: null,
  }, [{ id: trackId, title: 'Song', duration_in_sec: 123, track_number: 1 }]);
  assert.equal(queries[0].sql, 'BEGIN');
  assert.deepEqual(queries[2].values, [trackId, groupId, 'Song', 123, 1]);
  assert.equal(queries.at(-1).sql, 'COMMIT');
  assert.equal(released, true);
});

test('failed song insert rolls back the album and releases the connection', async () => {
  const queries = [];
  let released = false;
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('INSERT INTO songs')) throw new Error('Insert failed');
  }, release() { released = true; } };
  await assert.rejects(saveAlbum({ connect: async () => client }, { id: groupId }, [{ id: trackId }]), /Insert failed/);
  assert.equal(queries.at(-1), 'ROLLBACK');
  assert.ok(!queries.includes('COMMIT'));
  assert.equal(released, true);
});
