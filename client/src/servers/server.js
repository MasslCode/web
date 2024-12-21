/* eslint-disable no-undef */
import express from 'express';
import pool from './dbserver.js';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});