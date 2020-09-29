require("dotenv").config();               // Load .env file

const axios = require("axios");           // Loads axios for OAuth2 requests
const fs = require("fs");                 // Loads fs for reading and writing tokens.json
const AWS = require('aws-sdk');           // For reading and writing tokens.json to AWS S3
const qs = require("qs");                 // Loads qs for stringifying yahoo request data
const YahooFantasy = require("yahoo-fantasy");    // Loads module to make fantasy api calls clean and simple
const s3 = require("./s3.js");        // Imports s3ReadUpload.js

// Loads in the yahoo .env variables
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

const yf = new YahooFantasy(yahooAppId, yahooAppCode);            // Creates new instance of YahooFantasy

async function getData(parsedTokens) {
  console.log("Fetching data from Yahoo API.");
  try {
    yf.setUserToken(parsedTokens.access_token);
    const standings = await yf.league.standings(leagueKey);
    return standings;
  } catch (err) {
    if (err.description.includes("token_expired")) {
      console.log('Token is expired.');
      const newToken = await refreshAuthorizationToken(parsedTokens);
      if (newToken && newToken.data && newToken.data.access_token) {
        await s3.uploadFile(JSON.stringify(newToken.data));
        yf.setUserToken(newToken.data.access_token);
        const standings = await yf.league.standings(leagueKey);
        return standings;
      }
    } else {
      console.log(
        `Error with credentials in makeAPIrequest()/refreshAuthorizationToken(): ${err}`
        );
    }
  }
};

// Creates initial tokens.json file on S3
async function createAwsTokensFile() {
  try {
    console.log("Creating new tokens file.");
    const newTokens = await getInitialAuthorization();
    const parsedTokens = await s3.uploadFile(JSON.stringify(newTokens.data));
    return parsedTokens;
  } catch (err) {
    console.error(`Error in createAwsTokensFile(): ${err}`);
  }
}

// If token is expired, request new one using refresh token
function refreshAuthorizationToken(parsedTokens) {
  console.log('Refreshing token.');
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

async function getInitialAuthorization() {
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
    console.log(`Error in getInitialAuthorization():`);
    console.log(err);
  });
}

exports.getData = getData;
exports.createAwsTokensFile = createAwsTokensFile;
require('make-runnable');