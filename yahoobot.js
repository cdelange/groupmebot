// Load .env file
require("dotenv").config();

// Loads axios for OAuth2 requests
const axios = require("axios");

// Loads fs for reading and writing tokens.json
const fs = require("fs");

// For reading and writing tokens.json to AWS S3
const AWS = require('aws-sdk');

// Loads qs for stringifying yahoo request data
const qs = require("qs");

// Loads module to make fantasy api calls clean and simple
const YahooFantasy = require("yahoo-fantasy");

// Imports s3ReadUpload.js **FOR DEPLOYMENT**
const s3 = require("./s3ReadUpload.js");

// Loads in the yahoo env variables
const yahooClientId = process.env.YAHOOCLIENTID;
const yahooClientSecret = process.env.YAHOOCLIENTSECRET;
const yahooAppCode = process.env.YAHOOAPPCODE;
const yahooAppId = process.env.YAHOOAPPID;
const leagueKey = process.env.LEAGUEKEY;

// Client credentials converted to proper form for header in yahoo api requests
const AUTH_HEADER = Buffer.from(
  `${yahooClientId}:${yahooClientSecret}`,
  "binary"
  ).toString("base64");

// Pulls in tokens.json **FOR LOCAL DEV**
const tokenPath = "./tokens.json";

// let tokens = s3.readFile();

// Creates new instance of YahooFantasy
const yf = new YahooFantasy(yahooAppId, yahooAppCode);

async function getData(parsedTokens) {
  try {
    yf.setUserToken(parsedTokens.access_token);
    console.log('Retrieving Standings...');
    return await yf.league.standings(leagueKey);

  } catch (err) {
    if (err.description.includes("token_expired")) {
      const newToken = await refreshAuthorizationToken(parsedTokens);
      console.log("Waiting on new tokens...");
      if (newToken && newToken.data && newToken.data.access_token) {
        await s3.uploadFile(JSON.stringify(newToken.data));
        await yf.setUserToken(JSON.stringify(newToken.data));
        console.log("New tokens written to tokens.json.");
        const newTokens = await JSON.parse(newToken.data);
        await getData(newTokens);
        console.log("Rerunning getData()...");
      }
    } else {
      console.log(
        `Error with credentials in makeAPIrequest()/refreshAuthorizationToken(): ${err}`
        );
    }
    console.log(err);
  }
};

// Read tokens.json
async function createAwsTokensFile() {
  try {
    // Get initial authorization token
    const newToken = await getInitialAuthorization();
    const upload = await s3.uploadFile(JSON.stringify(newToken.data));
    return JSON.stringify(newToken.data);
  } catch (err) {
    console.error(`Error in createAwsTokensFile(): ${err}`);
  }
}

// If token is expired, request new one
function refreshAuthorizationToken(parsedTokens) {
  console.log('Refreshing tokens...');
  return axios({
    url: `https://api.login.yahoo.com/oauth2/get_token`,
    method: "post",
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      redirect_uri: "oob",
      grant_type: "refresh_token",
      refresh_token: parsedTokens.refresh_token,
    }),
  }).catch((err) => {
    console.error(`Error in refreshAuthorizationToken(): ${err}`);
  });
}


/* Makes a call to get the intial tokens using your manually pasted
YAHOOCLIENTSECRET, YAHOOAPPCODE, YAHOOCLIENTSECRET in your .env file */

async function getInitialAuthorization () {
  console.log('Getting inital authorization from Yahoo API...');
  return axios({
    url: 'https://api.login.yahoo.com/oauth2/get_token',
    method: 'post',
    headers: {
      'Authorization': `Basic ${AUTH_HEADER}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      client_id: yahooClientId,
      client_secret: yahooClientSecret,
      redirect_uri: 'oob',
      code: yahooAppCode,
      grant_type: 'authorization_code',
    })
  }).catch((err) => {
    console.error(`Error in getInitialAuthorization(): ${err}`);
  });
}


exports.getData = getData;
exports.createAwsTokensFile = createAwsTokensFile;
