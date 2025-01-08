/* eslint-disable no-undef */
// Import dependencies
import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Destructure the Pool object from the default import
const { Pool } = pkg;

// Set up the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Environment variable for the database URL
  ssl: false,
});

console.log('Database server has started. Connection pool is ready.');

pool.connect()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit with error code
  });

// Gracefully shut down the pool when the app exits
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

export default pool;