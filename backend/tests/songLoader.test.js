import test from 'node:test';
import assert from 'node:assert/strict';
import { createSongLoader } from '../../client/src/lib/songLoader.js';

const songs = [{ id: 'track', title: 'Song', track_number: 1, duration_in_sec: 60 }];
const response = () => new Response(JSON.stringify(songs), { headers: { 'Content-Type': 'application/json' } });

test('clicking during prefetch shares the pending request and reopening uses the completed cache', async () => {
  let finish;
  let calls = 0;
  const loader = createSongLoader({ fetcher: () => {
    calls++;
    return new Promise((resolve) => { finish = resolve; });
  } });
  loader.prefetch('/music', 'album');
  const clicked = loader.load('/music', 'album');
  await Promise.resolve();
  assert.equal(calls, 1);
  finish(response());
  assert.deepEqual(await clicked, songs);
  assert.deepEqual(loader.getCached('/music', 'album'), songs);
  assert.deepEqual(await loader.load('/music', 'album'), songs);
  assert.equal(calls, 1);
});

test('speculative loading is limited to one album; explicit clicks still load another album', async () => {
  const requests = [];
  const pending = [];
  const loader = createSongLoader({ fetcher: (url) => {
    requests.push(url);
    return new Promise((resolve) => pending.push(resolve));
  } });
  loader.prefetch('/music', 'first');
  loader.prefetch('/music', 'second');
  const explicitFirst = loader.load('/music', 'first');
  const explicitSecond = loader.load('/music', 'second');
  await Promise.resolve();
  assert.deepEqual(requests, ['/music/api/fetch-songs?albumId=first', '/music/api/fetch-songs?albumId=second']);
  pending.forEach((resolve) => resolve(response()));
  await Promise.all([explicitFirst, explicitSecond]);
});

test('a failed prefetch does not poison a subsequent explicit load', async () => {
  let calls = 0;
  const loader = createSongLoader({ fetcher: async () => ++calls === 1
    ? new Response(JSON.stringify({ error: 'Busy' }), { status: 503 }) : response() });
  loader.prefetch('/music', 'album');
  await assert.rejects(loader.load('/music', 'album'), /Busy/);
  assert.equal(loader.getCached('/music', 'album'), undefined);
  assert.deepEqual(await loader.load('/music', 'album'), songs);
  assert.equal(calls, 2);
});

test('track caches expire and are isolated by album and backend URL', async () => {
  let time = 0;
  let calls = 0;
  const loader = createSongLoader({ now: () => time, cacheTTL: 1000, fetcher: async () => { calls++; return response(); } });
  await loader.load('/music', 'a');
  assert.equal(loader.getCached('/music', 'b'), undefined);
  assert.equal(loader.getCached('/other-music', 'a'), undefined);
  await loader.load('/other-music', 'a');
  await loader.load('/music', 'a');
  assert.equal(calls, 2);
  time = 1001;
  assert.equal(loader.getCached('/music', 'a'), undefined);
  await loader.load('/music', 'a');
  assert.equal(calls, 3);
});

test('missing or invalid tracklists are not cached as successful results', async () => {
  for (const body of [[], { unexpected: true }]) {
    const loader = createSongLoader({ fetcher: async () => new Response(JSON.stringify(body)) });
    await assert.rejects(loader.load('/music', 'album'), /No tracklist/);
    assert.equal(loader.getCached('/music', 'album'), undefined);
  }
});
