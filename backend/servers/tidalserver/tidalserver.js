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
  const { query, countryCode = 'AT', limit = 20 } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query param "query" is required.' });
  }
    const params = new URLSearchParams({
      countryCode,
      include: 'albums',
    });
    console.log('[search-albums] Params:', params.toString());
  try {
    const client   = await tidalAxios();
    const response = await client.get(`/searchResults/${encodeURIComponent(query)}/relationships/albums?${params.toString()}`);

    // Pull just the albums array out of the JSON:API response for convenience
    const albums = response.data?.included ?? response.data?.data ?? response.data;
    res.json(albums);
  } catch (err) {
    handleError(res, err, 'GET /api/search-albums');
  }
}
);

app.listen(PORT, async () => {
  console.log(`\n🎵  Tidal server running on Port: ${PORT}`);

  startTokenRefreshDaemon();

  try {
    const token = await getTidalToken();
    console.log('[Startup] Tidal token ready:\n', token);
  } catch (err) {
    console.error('[Startup] Failed to obtain initial Tidal token:', err.message);
  }
});