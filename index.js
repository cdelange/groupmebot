

// Load Express and JSON parsing middleware
const express = require("express");
const bodyParser = require("body-parser");

// Imports bot.js
const bot = require('./bot.js');

const PORT = process.env.PORT || 3000;
const app = express();


// Test get endpoint
app.get("/", (req, res) => res.send("API Running"));

// Test post endpoint that makes groupme message
app.post("/", async (req, res)  => {
  try {
    const message = await bot.postMessage();
    res.send('Message sent to GroupMe');
    console.log('Message sent!')
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Starts server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
