const express = require('express');
const cors = require('cors');
const app = express();
const connectDb = require('../config/db');
const morgan = require('morgan');
const userRoutes = require('../routes/userRoutes');
const postRoutes = require('../routes/postRoutes');
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5174',
  'https://nevzattalhaozcan.github.io'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Connect to the database once
connectDb();

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening at http://127.0.0.1:${PORT}`);
});