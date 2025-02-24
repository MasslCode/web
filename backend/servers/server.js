/* eslint-disable no-undef */
import express from 'express';
import pool from './dbserver.js';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Endpoint to fetch albums
app.get('/api/albums', async (req, res) => {
  const { page = 1, limit = 20, sort } = req.query;
  const offset = (page - 1) * limit;
  try {
    console.log(sort);
    if(sort === "RANKING_DESC")
    {
      const result = await pool.query('SELECT * FROM albums ORDER BY average_rating DESC, added_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }
    if(sort === "RANKING_ASC")
    {
      const result = await pool.query('SELECT * FROM albums ORDER BY average_rating ASC, added_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }
    if(sort === "DATE_ADDED_ASC")
    {
      const result = await pool.query('SELECT * FROM albums ORDER BY added_at ASC, average_rating DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }
    if(sort === "DATE_ADDED_DESC")
    {
      const result = await pool.query('SELECT * FROM albums ORDER BY added_at DESC, average_rating DESC LIMIT $1 OFFSET $2', [limit, offset]);
    }
    const albumCount = await pool.query('SELECT COUNT(*) FROM albums');
    const totalCount = parseInt(albumCount.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({ albums: result.rows, totalPages }); // Send the rows as JSON
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Database query failed.' });
  }
});

app.post('/api/save-album', async (req, res) => {
  console.log("endpoint save working, req body:", req.body);
    const { album, songs } = req.body;

    if(!album || !songs) {
      return res.status(400).json({ error: 'Album and songs are required. Check if either or both of the data is missing'});
    }
  try {
    const albumQuery = `INSERT INTO albums (id, title, artist, release_year, average_rating, cover_image)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (id) DO UPDATE
                        SET title = EXCLUDED.title,
                            artist = EXCLUDED.artist,
                            release_year = EXCLUDED.release_year,
                            average_rating = EXCLUDED.average_rating,
                            cover_image = EXCLUDED.cover_image`;

    console.log("Starting insert query for album");

    await pool.query(albumQuery, [
      album.id,
      album.title,
      album.artist,
      album.release_year,
      album.average_rating,
      album.cover_image,
    ]);

    console.log("After album insert");

    console.log("Starting insert query for songs");
    
      const songQuery = `INSERT INTO songs (id, album_id, title, duration_in_sec, track_number, rating)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (id) DO UPDATE
                         SET album_id = EXCLUDED.album_id,
                             title = EXCLUDED.title,
                             duration_in_sec = EXCLUDED.duration_in_sec,
                             track_number = EXCLUDED.track_number,
                             rating = EXCLUDED.rating`;

    for (const song of songs) {
      await pool.query(songQuery, [
        song.id,
        album.id,
        song.title,
        song.duration_in_sec,
        song.track_number,
        song.rating,
      ]);
    }
    console.log("Queries finished. Checking for success...");
    res.status(200).json({ message: 'Album and songs saved successfully!' });
  } catch (error) {
    console.error('Error adding album and songs:', error);
    res.status(500).json({ error: 'Database query failed (internal server error). Look for problems when adding album or songs'});
  }
})

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});