/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpirationTime = null;

// Fetch a new Spotify token
export const fetchSpotifyToken = async () => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpirationTime = Date.now() + response.data.expires_in * 1000;
    console.log('Fetched new Spotify token:', cachedToken);
  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    throw new Error('Failed to fetch Spotify token');
  }
};

// Middleware to ensure a valid token
export const ensureSpotifyToken = async (req, res, next) => {
  try {
    if (!cachedToken || Date.now() >= tokenExpirationTime) {
      await fetchSpotifyToken();
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to ensure Spotify token' });
  }
};

// Get the current valid token
export const getSpotifyToken = () => {
  if (!cachedToken || Date.now() >= tokenExpirationTime) {
    throw new Error('Spotify token is not valid. Fetch a new one.');
  }
  return cachedToken;
};