// Load .env file
require("dotenv").config();

// Load axios
const axios = require("axios");

// Bot ID stored in .env file
const TOKEN = process.env.TOKEN;


async function postMessage() {

  let botResponse = "Test text"

  let body = {
    "bot_id": TOKEN,
    "text": botResponse
  };

  console.log('Sending ' + botResponse + ' to ' + TOKEN);

  let res = await axios.post("https://api.groupme.com/v3/bots/post", body)
}


exports.postMessage = postMessage;