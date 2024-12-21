/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from 'cors';
import { ensureSpotifyToken, getSpotifyToken } from "../data/spotifyAuth.js";

dotenv.config();

const app = express();
const PORT = process.env.SPOTIFY_SERVER_PORT; 

app.use(cors());

app.use(ensureSpotifyToken);

app.get("/api/search-albums", async (req, res) => {
  const { query } = req.query;
  if (!query)
  {
    return res.status(400).json({error: "Query parameter is required"});
  }

  try {
    const token = getSpotifyToken();
    const response = await axios.get("https://api.spotify.com/v1/albums/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: "album",
        limit: 10,
      },
    });

    res.json(response.data.albums.items);
  } catch (error) {
    console.error("Error searching albums: ", error.response?.data || error.message);
    res.status(500).json({error: "Failed to search albums on Spotify"});
  }
})

app.get('') 
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });