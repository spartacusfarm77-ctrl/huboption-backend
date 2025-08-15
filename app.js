// Load environment variables from cPanel
require('dotenv').config();

// Import necessary packages
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Basic setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); // Middleware to parse JSON

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('CRITICAL: Database connection failed on startup:', err);
  } else {
    console.log('Successfully connected to the MySQL database.');
  }
});

// --- API Routes ---

// Root route to check the API status
app.get('/hub/', (req, res) => {
  res.send('Huboption API is running.');
});

// User Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    const values = [username, email, hashedPassword];

    db.query(sql, values, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Username or email already exists.' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Database error occurred.' });
      }
      res.status(201).json({ message: 'User created successfully!' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});