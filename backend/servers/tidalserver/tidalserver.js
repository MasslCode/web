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
        : 'http://localhost:5371'
}));

app.use(express.json());

async function tidalAxios(){
    const token = await getTidalToken();

    return axios.create({
    baseURL: TIDAL_API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept':        'application/vnd.tidal.v1+json',
      'Content-Type':  'application/vnd.tidal.v1+json',
    },
  });
}

function handleError(res, err, context = 'Tidal API error') {
  const status  = err.response?.status  ?? 500;
  const message = err.response?.data    ?? err.message;
  console.error(`[${context}]`, message);
  res.status(status).json({ error: context, detail: message });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`\n🎵  Tidal server running on http://localhost:${PORT}`);
  console.log(`    Health check → http://localhost:${PORT}/health\n`);

  // Kick off proactive background token refresh (checks every 60 s)
  startTokenRefreshDaemon();

  // Eagerly fetch a token on startup so the first real request is instant
  try {
    await getToken();
    console.log('[Startup] Tidal token ready.\n');
  } catch (err) {
    console.error('[Startup] Failed to obtain initial Tidal token:', err.message);
  }
});