// Load Express and JSON parsing middleware
const express = require("express");
const bodyParser = require("body-parser");

// Imports bot.js
const bot = require("./groupmebot.js");
const yahoo = require("./yahoobot.js");

// Imports s3ReadUpload.js **FOR DEPLOYMENT**
const s3 = require("./s3ReadUpload.js");

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
    const exists = await s3.fileExists()

    if(isCommand){
      if ( text == '@help' ) {
        console.log('Command was @help');
        bot.helpMessage();
    } else if ( exists ) {
      console.log(`Command was "${text}"`);
      console.log(`Tokens.josn exists? ${exists}`);
      console.log("Reading file from AWS...");
      const tokens = await s3.readFile();
      const parsedTokens = JSON.parse(tokens.toString());
      console.log("Getting data from Yahoo API...");
      const data = await yahoo.getData(parsedTokens);
      console.log("Formatting Yahoo return object...");
      const message = await bot.formatObj(data, text);
    } else {
      console.log(`Tokens.josn exists? ${exists}`);
      console.log("Creating tokens.json on AWS...");
      const refreshedTokens = await yahoo.createAwsTokensFile()
      console.log(refreshedTokens);
      console.log("Converting String to JSON...");
      const parsedRefreshedTokens = await JSON.parse(refreshedTokens.toString());
      console.log("Getting data from Yahoo API...");
      const data = await yahoo.getData(parsedRefreshedTokens);
      console.log("Formatting Yahoo return object...");
      const message = await bot.formatObj(data, text)
    }
      res.sendStatus(200);

    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log("Error in app.post: ");
    console.log(err);
  }
});

// Starts server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
