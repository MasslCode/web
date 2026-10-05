import express from 'express';
import cors from 'cors';
import { isMBID } from './service.js';

export function createMusicApp(service) {
  const app = express();
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? 'https://web-lemon-three.vercel.app'
      : 'http://localhost:5173',
  }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', provider: 'musicbrainz' }));

  function handleError(res, error) {
    const upstreamStatus = error.response?.status;
    console.error('[MusicBrainz]', upstreamStatus || error.status || error.code || error.message);
    if ([429, 503].includes(upstreamStatus)) {
      res.set('Retry-After', '5');
      return res.status(503).json({ error: 'MusicBrainz is busy. Please try again shortly.', retryAfter: 5 });
    }
    if (error.status === 404 || upstreamStatus === 404) {
      return res.status(404).json({ error: 'No tracklist is available for this album in MusicBrainz.' });
    }
    return res.status(502).json({ error: 'Unable to retrieve MusicBrainz data. Please try again.' });
  }

  app.get('/api/search-albums', async (req, res) => {
    const { query, limit = '15' } = req.query;
    if (typeof query !== 'string' || !query.trim() || query.length > 200) {
      return res.status(400).json({ error: 'Query must be a non-empty string of at most 200 characters.' });
    }
    if (typeof limit !== 'string' || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) {
      return res.status(400).json({ error: 'Limit must be an integer between 1 and 100.' });
    }
    try {
      res.json(await service.searchAlbums(query.trim(), Number(limit)));
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/fetch-songs', async (req, res) => {
    if (!isMBID(req.query.albumId)) {
      return res.status(400).json({ error: 'albumId must be a MusicBrainz release-group ID.' });
    }
    try {
      res.json(await service.fetchSongs(req.query.albumId.toLowerCase()));
    } catch (error) {
      handleError(res, error);
    }
  });
  return app;
}
