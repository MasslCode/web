import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSongDurations } from '../../client/src/lib/songDurations.js';
import { createSongLoader } from '../../client/src/lib/songLoader.js';
import { saveAlbum } from '../servers/saveAlbum.js';

test('legacy Tidal durations survive loading, caching and saving as seconds', async () => {
  const raw = [
    { id: '121262459', title: 'Showdown', duration_in_ISO8601: 'PT4M34S', track_number: 0 },
    { id: 'other', title: 'Another song', duration_in_ISO8601: 'PT1H2M3.5S', track_number: 1 },
  ];
  const loader = createSongLoader({ fetcher: async () => new Response(JSON.stringify(raw)) });
  const songs = await loader.load('/music', '121262458');
  assert.deepEqual(songs.map((song) => song.duration_in_sec), [274, 3724]);
  assert.deepEqual(loader.getCached('/music', '121262458'), songs);
  assert.equal(raw[0].duration_in_sec, undefined);
  const queries = [];
  await saveAlbum({ connect: async () => ({
    async query(sql, values) { queries.push({ sql, values }); }, release() {},
  }) }, { id: '121262458' }, songs);
  assert.equal(queries[2].values[3], 274);
  assert.equal(queries[3].values[3], 3724);
});

test('current seconds take precedence and explicit unknown durations stay unknown', () => {
  const songs = normalizeSongDurations([
    { duration_in_sec: 123, duration_in_ISO8601: 'PT9M' },
    { duration_in_sec: 0, duration_in_ISO8601: 'PT9M' },
    { duration_in_sec: null, duration_in_ISO8601: 'PT9M' },
    { duration_in_sec: 123.6 },
  ]);
  assert.deepEqual(songs.map((song) => song.duration_in_sec), [123, 0, null, 124]);
});

test('missing and malformed durations are not counted as zero', () => {
  for (const value of [undefined, null, '', 'PT', 'PT-1S', 'PT1S garbage', 'garbage PT1S', 'P1Y', '3:20']) {
    assert.equal(normalizeSongDurations([{ duration_in_ISO8601: value }])[0].duration_in_sec, null, String(value));
  }
  for (const value of [NaN, Infinity, -1, '274', Number.MAX_VALUE]) {
    assert.equal(normalizeSongDurations([{ duration_in_sec: value, duration_in_ISO8601: 'PT1S' }])[0].duration_in_sec, null);
  }
  assert.equal(normalizeSongDurations([{ duration_in_ISO8601: 'PT0S' }])[0].duration_in_sec, 0);
});
