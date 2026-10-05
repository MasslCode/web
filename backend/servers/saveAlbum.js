export async function saveAlbum(pool, album, songs) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO albums (id, title, artist, release_year, average_rating, cover_image)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, artist = EXCLUDED.artist,
      release_year = EXCLUDED.release_year, average_rating = EXCLUDED.average_rating,
      cover_image = EXCLUDED.cover_image`, [
      album.id, album.title, album.artist, album.release_year, album.average_rating, album.cover_image,
    ]);
    for (const song of songs) {
      await client.query(`INSERT INTO songs (id, album_id, title, duration_in_sec, track_number)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET album_id = EXCLUDED.album_id, title = EXCLUDED.title,
        duration_in_sec = EXCLUDED.duration_in_sec, track_number = EXCLUDED.track_number`, [
        song.id, album.id, song.title, song.duration_in_sec, song.track_number,
      ]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
