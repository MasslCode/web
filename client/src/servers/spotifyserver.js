/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.SPOTIFY_SERVER_PORT; 
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });