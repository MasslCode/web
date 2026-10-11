/* eslint-disable no-undef */
import express from 'express';
import pool from './dbserver.js';
import cors from 'cors';
import { saveAlbum } from './saveAlbum.js';
import { createCollectionRouter } from './collection.js';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://web-lemon-three.vercel.app'
    : 'http://localhost:5173'
}));

app.use('/api', createCollectionRouter(pool));

app.post('/api/save-album', async (req, res) => {
    const { album, songs } = req.body;

    if(!album || !Array.isArray(songs)) {
      return res.status(400).json({ error: 'Album and songs are required. Check if either or both of the data is missing'});
    }
  try {
    await saveAlbum(pool, album, songs);
    res.status(200).json({ message: 'Album and songs saved successfully!' });
  } catch (error) {
    console.error('Error adding album and songs:', error);
    res.status(500).json({ error: 'Database query failed (internal server error). Look for problems when adding album or songs'});
  }
});

app.get('/api/albums/:albumID/songs', async (req, res) => {
  const albumID = req.params.albumID;
  console.log("get songs from db endpoint reached with album id: ", albumID);
  try {
    const result = await pool.query('SELECT * FROM songs WHERE album_id = $1 ORDER BY track_number ASC, id ASC', [albumID]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
  
});

app.put('/api/edit-album', async (req, res) => {
  console.log("Edit-album endpoint reached: ", req.body);
  const { id, average_rating } = req.body;
    if(!id || average_rating === undefined) {
      return res.status(400).json({ error: 'Album id or rating missing/undefined'});
    }
    const parsedRating = parseFloat(average_rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10 and a number'});
    }
  const albumQuery = `UPDATE albums SET average_rating = $1 WHERE id = $2 RETURNING *`;

  try {
    const result = await pool.query(albumQuery, [parsedRating, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    return res.status(200).json({ success: true, album: result.rows[0] });
  } catch (error) {
    console.error('Error updating album:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
