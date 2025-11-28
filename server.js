require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const externalRoutes = require('./routes/external');
const blogRoutes = require('./routes/blog');
const config = require('./config');

const app = express();
const PORT = config.PORT;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(client => {
    console.log('Connected successfully to PostgreSQL database!');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to database:', err.stack);
  });

const corsOptions = {
  origin: config.CORS_ALLOWED_ORIGINS,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Attach the database pool to the request object so routes can access it
app.use((req, res, next) => {
  req.dbPool = pool;
  next();
});

app.use('/api', externalRoutes); // Handles /api/music, /api/github, etc.
app.use('/api', blogRoutes);    // Handles /api/posts

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});