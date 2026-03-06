/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from 'cors';
import { ensureSpotifyToken, getSpotifyToken } from "./spotifyAuth.js";

dotenv.config();

const app = express();
const PORT = process.env.SPOTIFY_SERVER_PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://web-lemon-three.vercel.app/'
    : 'http://localhost:5371'
}));

app.use(ensureSpotifyToken);

app.get("/api/search-albums", async (req, res) => {
  const { query } = req.query;
  if (!query)
  {
    return res.status(400).json({error: "Query parameter is required"});
  }
  try {
    const token = getSpotifyToken();
    const response = await axios.get("https://api.spotify.com/v1/search/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: "album",
        limit: 20,
      },
    });

    console.log("Full URL:", response.config.url);
    res.json(response.data.albums.items);
  } catch (error) {
    console.error("Error searching albums: ", error.response?.data || error.message);
    res.status(500).json({error: "Failed to search albums on Spotify"});
  }
})

app.get("/api/fetch-songs", async (req, res) => {
  const { albumId } = req.query;
  if (!albumId)
  {
    return res.status(400).json({error: "Album ID is requried"});
  }
  try {
    const token = getSpotifyToken();
    console.log(albumId);
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 30,
      },  
    });

    res.json(response.data.items);
  } catch (error) {
    if (error.response?.status === 429)
    {
      const retryAfter = error.response.headers['retry-after'];
      console.log('Spotify Retry-After Header:', retryAfter);
      console.warn(`You're rate limited. Retrying after ${retryAfter} seconds.`);

      // Send a 503 Service Unavailable with Retry-After header to the client
      res.setHeader('Retry-After', retryAfter);
      return res.status(503).json({
        error: "Rate limited by Spotify API. Please try again later.",
        retryAfter: parseInt(retryAfter, 10),
      });
      
    }
    else{
      console.error("Error searching album with given ID => ", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch songs" });
    }
    
  }
})

app.get('') 
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
  });

  