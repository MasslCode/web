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
  ssl: {
    rejectUnauthorized: false, // Enable this if you're connecting to a hosted DB requiring SSL
  },
});

// Function to query the database
export const queryDatabase = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Gracefully shut down the pool when the app exits
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
  process.exit(0);
});

export default pool;