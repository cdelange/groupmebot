// Load Express and JSON parsing middleware
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

// Imports bot.js
const bot = require("./groupmebot.js");
const yahoo = require("./yahoobot.js");

const PORT = process.env.PORT || 3000;
const app = express();

// Sets up bodyParser middleware to handle request from GroupMe
app.use(bodyParser.json());

// Test get endpoint
app.get("/", (req, res) => res.send("API Running..."));

// Test post endpoint that makes groupme message
app.post("/", async (req) => {
  try {
    const { text } = req.body;
    const isCommand = bot.commandListener(text);
    console.log("Is it a command: " + isCommand);
    if (isCommand) {
      const credentials = await yahoo.readCredentials();
      const data = await yahoo.getData();
      const message = await bot.formatObj(data, text)
    }
  } catch (err) {
    console.log(err)
  }
});

// Starts server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
