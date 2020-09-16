// Load .env file
require('dotenv').config();

// Load Express and JSON parsing middleware
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const app = express();


// Bot ID stored in .env file
const TOKEN = process.env.TOKEN;


// Test endpoint
app.get('/', (req, res) => res.send('API Running'));


// Starts server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));