// Load Express and JSON parsing middleware
const express = require("express");
const bodyParser = require("body-parser");

// Imports bot.js
const bot = require("./groupmebot.js");
const yahoo = require("./yahoobot.js");

// Imports s3ReadUpload.js **FOR DEPLOYMENT**
const s3 = require("./s3.js");

const PORT = process.env.PORT || 3000;
const app = express();

// Sets up bodyParser middleware to handle request from GroupMe
app.use(bodyParser.json());

// Test get endpoint
app.get("/", (req, res) => res.send("API Running..."));

// Test post endpoint that makes groupme message
app.post("/", async function incomingMessage(req, res) {
  try {
    const { text } = req.body;
    const isCommand = bot.commandListener(text);

    if (isCommand) {
      const exists = await s3.fileExists();

      if (text == "@help") {
        console.log("Command was @help");
        bot.helpMessage();
      } else if (exists) {
        const tokens = await s3.readFile();
        const data = await yahoo.getData(tokens);
        bot.formatObj(data, text);
      } else if (!exists) {
        const createTokens = await yahoo.createAwsTokensFile();
        const newTokens = await s3.readFile();
        const data = await yahoo.getData(newTokens);
        bot.formatObj(data, text);
      }
    }
  } catch (err) {
    console.log("Error in app.post...");
    console.log(err);
  }
  res.sendStatus(200);
});

// Starts server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));