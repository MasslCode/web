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
    const response = await axios.get("https://api.spotify.com/v1/search/", {
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

app.get("/api/fetch-songs", async (req, res) => {
  const { albumId } = req.query;
  if (!albumId)
  {
    return res.status(400).json({error: "Album ID is requried"});
  }
  try {
    const token = getSpotifyToken();
    console.log(albumId);
    const encodeurl = encodeURIComponent(albumId);
    const url = `https://api.spotify.com/v1/albums/${encodeurl}/tracks`;
    console.log(url);
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
    console.error("Error searching album with given ID => ", error.response?.data || error.message)
  }
})

app.get('') 
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  