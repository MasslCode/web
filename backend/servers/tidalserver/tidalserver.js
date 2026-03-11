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

// Helper: retry a function up to maxRetries times on 429
async function withRetry(fn, maxRetries = 3, baseDelay = 500) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.response?.status === 429;
      const isLast = attempt === maxRetries;

      if (!is429 || isLast) throw err;

      const delay = baseDelay * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms
      console.warn(`[retry] 429 on attempt ${attempt + 1}, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/search-albums', async (req, res) => {
  const { query, countryCode = 'AT', limit = 15 } = req.query;

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
    // Step 1: get albums
    const params = new URLSearchParams({ countryCode, include: 'albums' });
    const searchRes = await client.get(
      `searchResults/${encodeURIComponent(query)}/relationships/albums?${params.toString()}`
    );

    const allIncluded = searchRes.data?.included ?? [];
    const filtered = allIncluded.filter((a) =>
      a.attributes?.numberOfItems >= 5 &&
      (a.attributes?.type === 'ALBUM' || a.attributes?.type === 'EP')
    );
    const albums = filtered.slice(0, limit);

    const enriched = [];
    for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    try {
      // Small delay between each album's enrichment to avoid rate limiting
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 150));

      const [coverRes, artistRes] = await Promise.all([
        withRetry(() => client.get(`albums/${album.id}/relationships/coverArt`, {
          params: { countryCode, include: 'coverArt' }
        })),
        withRetry(() => client.get(`albums/${album.id}/relationships/artists`, {
          params: { countryCode, include: 'artists' }
        })),
      ]);

      const files      = coverRes.data?.included?.[0]?.attributes?.files ?? [];
      const cover      = files.find((f) => f.meta?.width === 320) ?? files[0];
      const artists    = artistRes.data?.included ?? [];
      const artistNames = artists.map((a) => a.attributes?.name).join(' - ');

      enriched.push({
        id:            album.id,
        title:         album.attributes?.title,
        artist:        artistNames,
        release_year:  new Date(album.attributes?.releaseDate).getFullYear(),
        cover_image:   cover?.href ?? null,
        numberOfItems: album.attributes?.numberOfItems,
        type:          album.attributes?.type,
      });
    } catch (err) {
      console.error(`[enrich] Failed for album ${album.id}:`, err.response?.status, err.message);
      // Still include the album, just without cover/artist
      enriched.push({
        id:            album.id,
        title:         album.attributes?.title,
        artist:        '',
        release_year:  new Date(album.attributes?.releaseDate).getFullYear(),
        cover_image:   null,
        numberOfItems: album.attributes?.numberOfItems,
        type:          album.attributes?.type,
      });
    }
  }

    res.json(enriched);
  } catch (err) {
    handleError(res, err, 'GET /api/search-albums');
  }
});

app.get('/api/fetch-songs', async (req, res) => {
  const { albumId, countryCode = 'AT' } = req.query;

  if (!albumId || albumId.trim().length === 0) {
    return res.status(400).json({ error: 'Query param "albumId" is required.' });
  }
    const params = new URLSearchParams({
      countryCode,
      include: 'items',
    });

  try {
    const client = await tidalAxios();
    const response = await client.get(`albums/${albumId}/relationships/items?${params.toString()}`);
    const songs = response.data?.included ?? [];
    console.log(songs);
    const formatted = songs.map((s) => ({
      id: s.id,
      title: s.attributes?.title,
      duration_in_ISO8601: s.attributes?.duration ?? 0,
      track_number: s.attributes?.trackNumber ?? 0,
    }));
    res.json(formatted);
  } catch (error) {
    handleError(res, err, 'GET /api/fetch-songs');
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