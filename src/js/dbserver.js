const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

pool.connect()
.then(() => console.log("Connected to PostgreSQL"))
.catch(err => console.error("Connection error", err.stack));