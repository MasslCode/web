import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import { createCollectionRouter } from '../servers/collection.js';

async function collection(t, { count = 45, albums = [], fail = false } = {}) {
  const calls = [];
  const app = express();
  app.use('/api', createCollectionRouter({
    async query(sql, values) {
      calls.push({ sql, values });
      if (fail) throw new Error('Database unavailable');
      return { rows: sql.startsWith('SELECT COUNT(*)') ? [{ count: String(count) }]
        : sql.endsWith('LIMIT 20') ? albums.slice(0, 20) : albums };
    },
  }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  return {
    calls,
    get: path => fetch(`http://127.0.0.1:${server.address().port}/api${path}`),
  };
}

test('collection search counts all matches and returns page 2 with the same filter and sort', async t => {
  const albums = [{ id: 'matching-21', title: 'Shared title', artist: 'Shared artist' }];
  const { get, calls } = await collection(t, { count: 45, albums });
  const response = await get('/albums?search=Shared&page=2&limit=20&sort=RANKING_ASC');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { albums, page: 2, totalPages: 3, totalCount: 45, search: 'Shared' });
  assert.equal(calls[0].sql, 'SELECT COUNT(*) FROM albums WHERE (title ILIKE $1 OR artist ILIKE $1)');
  assert.deepEqual(calls[0].values, ['%Shared%']);
  assert.equal(calls[1].sql, 'SELECT * FROM albums WHERE (title ILIKE $1 OR artist ILIKE $1) ORDER BY average_rating ASC, added_at DESC, id ASC LIMIT $2 OFFSET $3');
  assert.deepEqual(calls[1].values, ['%Shared%', 20, 20]);
});

test('every sort has a stable album ID tie-breaker for page boundaries', async t => {
  const { get, calls } = await collection(t);
  for (const [sort, order] of Object.entries({
    RANKING_DESC: 'average_rating DESC, added_at DESC',
    RANKING_ASC: 'average_rating ASC, added_at DESC',
    DATE_ADDED_ASC: 'added_at ASC, average_rating DESC',
    DATE_ADDED_DESC: 'added_at DESC, average_rating DESC',
  })) {
    const response = await get(`/albums?page=3&limit=20&sort=${sort}`);
    assert.equal(response.status, 200);
    await response.json();
    assert.equal(calls.at(-1).sql, `SELECT * FROM albums ORDER BY ${order}, id ASC LIMIT $1 OFFSET $2`);
    assert.deepEqual(calls.at(-1).values, [20, 40]);
  }
});

test('a page beyond the current collection clamps to its last available page', async t => {
  const { get, calls } = await collection(t, { count: 21 });
  const data = await (await get('/albums?page=999999999&limit=20')).json();
  assert.equal(data.page, 2);
  assert.equal(data.totalPages, 2);
  assert.deepEqual(calls.at(-1).values, [20, 20]);
});

test('empty results return an empty collection and a valid current page', async t => {
  const { get, calls } = await collection(t, { count: 0 });
  assert.deepEqual(await (await get('/albums?search=missing&page=3&limit=20')).json(), {
    albums: [], page: 1, totalPages: 0, totalCount: 0, search: 'missing',
  });
  assert.deepEqual(calls.at(-1).values, ['%missing%', 20, 0]);
});

test('search safely passes literal punctuation and wildcard characters as parameters', async t => {
  const { get, calls } = await collection(t);
  const search = "  100%_\\'; DROP TABLE albums; --  ";
  assert.equal((await get(`/albums?limit=20&search=${encodeURIComponent(search)}`)).status, 200);
  assert.equal(calls[0].values[0], "%100\\%\\_\\\\'; DROP TABLE albums; --%");
  assert.ok(calls.every(call => !call.sql.includes('DROP TABLE')));
});

test('invalid query parameters are rejected before querying the database', async t => {
  const { get, calls } = await collection(t);
  for (const query of [
    'page=0', 'page=-1', 'page=1.5', 'page=2abc', 'page=9007199254740992',
    'limit=0', 'limit=-1', 'limit=101', 'limit=abc', 'page=1&page=2',
    'search[]=foo', 'sort=DROP%20TABLE%20albums', 'sort=toString', 'sort[]=RANKING_DESC',
  ]) {
    const response = await get(`/albums?${query}`);
    assert.equal(response.status, 400, query);
    await response.json();
  }
  assert.equal(calls.length, 0);
});

test('the tier list still receives the entire collection, and older lookup clients keep their array', async t => {
  const albums = Array.from({ length: 45 }, (_, id) => ({ id }));
  const { get, calls } = await collection(t, { albums });
  assert.deepEqual(await (await get('/albums')).json(), { albums });
  assert.ok(!calls.at(-1).sql.includes('LIMIT'));
  assert.deepEqual(await (await get('/lookup-albums?lookupString=Shared')).json(), albums.slice(0, 20));
  assert.ok(calls.at(-1).sql.endsWith('LIMIT 20'));
  const paged = await (await get('/lookup-albums?lookupString=Shared&page=2&limit=20')).json();
  assert.equal(paged.totalPages, 3);
  assert.equal(paged.page, 2);
  assert.deepEqual(calls.at(-1).values, ['%Shared%', 20, 20]);
});

test('a database failure returns an HTTP error rather than an empty successful page', async t => {
  t.mock.method(console, 'error', () => {});
  const { get } = await collection(t, { fail: true });
  const response = await get('/albums?limit=20');
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Failed to load albums.' });
});
