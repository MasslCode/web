import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getTidalToken, startTokenRefreshDaemon } from './tidalAuth.js';
import axios from 'axios';
const app = express();

const PORT = process.env.TIDAL_SERVER_PORT || 3002;
const TIDAL_API_URL = 'https://openapi.tidal.com/v2';

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://web-lemon-three.vercel.app/'
        : 'http://localhost:5173'
}));

app.use(express.json());

async function tidalAxios(){
    const token = await getTidalToken();

    return axios.create({
    baseURL: TIDAL_API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      //lines below fail the api call. It seems they are not needed to pass on
      //'accept':        'application/vnd.tidal.v1+json',
      //'Content-Type':  'application/vnd.tidal.v1+json',
    },
  });
}

function handleError(res, err, context = 'Tidal API error') {
  const status  = err.response?.status ?? 500;
  const message = err.response?.data ?? err.message ?? 'Unknown error';
  
  // Log the full error so we can see what Tidal actually returns
  console.error(`[${context}] Status: ${status}`);
  console.error(`[${context}] Message:`, JSON.stringify(message));
  console.error(`[${context}] Full error:`, err.response?.data ?? err.stack);
  
  res.status(status).json({ error: context, detail: message });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/search-albums', async (req, res) => {
  const { query, countryCode = 'AT', limit = 10 } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query param "query" is required.' });
  }
    const params = new URLSearchParams({
      countryCode,
      include: 'albums,coverArt,albums.artists',
    });
    console.log('[search-albums] Params:', params.toString());
  try {
    const client   = await tidalAxios();
    const response = await client.get(`/searchResults/${encodeURIComponent(query)}/relationships/albums?${params.toString()}`);

    const data = response.data;
    const slicedData     = data?.data?.slice(0, limit) ?? [];
    const allowedIds     = new Set(slicedData.map((a) => a.id));
    const slicedIncluded = data?.included?.filter((a) => allowedIds.has(a.id)) ?? [];

    // Pull just the albums array out of the JSON:API response for convenience
    res.json({ ...data, data: slicedData, included: slicedIncluded });
  } catch (err) {
    handleError(res, err, 'GET /api/search-albums');
  }
}
);

app.get('/api/album-cover/:id', async (req, res) => {
  const { id } = req.params;
  const { countryCode = 'AT' } = req.query;
  const params = new URLSearchParams({
      countryCode,
      include: 'coverArt',
    });
  try {
    const client = await tidalAxios();
    const response = await client.get(`albums/${id}/relationships/coverArt?${params.toString()}`);
    const files = response.data?.included?.[0]?.attributes?.files ?? [];
    const file = files.find((f) => f.meta?.width === 320) ?? files[0];

    res.json({ url: file?.href ?? null });
  } catch (err) {
    handleError(res, err, `GET /api/album-cover/${id}`);
  }
});

app.listen(PORT, async () => {
  console.log(`\n🎵  Tidal server running on Port: ${PORT}`);

  startTokenRefreshDaemon();

  try {
    await getTidalToken();
    console.log('[Startup] Tidal token ready\n');
  } catch (err) {
    console.error('[Startup] Failed to obtain initial Tidal token:', err.message);
  }
});