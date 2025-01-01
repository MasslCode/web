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
  try {
    const result = await pool.query('SELECT * FROM albums;');
    res.json(result.rows); // Send the rows as JSON
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
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        title=VALUES(title),
                        artist=VALUES(artist),
                        release_year=VALUES(release_year),
                        average_rating=VALUES(average_rating),
                        cover_image=VALUES(cover_image)`;

    console.log("Starting insert query for album");

    await pool.execute(albumQuery, [
      album.id,
      album.title,
      album.artist,
      album.release_year,
      album.average_rating,
      album.cover_image,
    ]);

    console.log("After album insert");

    console.log("Starting insert query for songs");
    const songQueries = songs.map((song) => {
      const songQuery = `INSERT INTO songs (id, album_id, title, duration_in_sec, track_number, rating)
                         VALUES (?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE
                         rating=VALUES(rating)`;
      return pool.execute(songQuery, [
        song.id,
        album.id,
        song.title,
        song.duration_in_sec,
        song.track_number,
        song.rating,
      ]);
    });
    console.log("After song insert");
    console.log("execute promise all");
    await Promise.all(songQueries);

    res.status(200).json({ message: 'Album and songs saved successfully!' });
  } catch (error) {
    console.error('Error adding album and songs:', error);
    res.status(500).json({ error: 'Database query failed (internal server error). Look for problems when adding album or songs'});
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});