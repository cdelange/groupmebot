// Load .env file
require("dotenv").config();

// Loads axios for OAuth2 requests
const axios = require("axios");

// Loads fs for reading and writing tokens.json
const fs = require("fs");

// Loads qs for stringifying yahoo request data
const qs = require("qs");

// Loads module to make fantasy api calls clean and simple
const YahooFantasy = require("yahoo-fantasy");

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

// Pulls in tokens.json
const tokenPath = "./tokens.json";

let tokens = null;

// Creates new instance of YahooFantasy
const yf = new YahooFantasy(yahooAppId, yahooAppCode);

async function getData() {
  try {
    yf.setUserToken(tokens.access_token);
    console.log('Retrieving Standings...');
    return yf.league.standings(leagueKey);
  } catch (err) {
    if (err.description.includes("token_expired")) {
      const newToken = await refreshAuthorizationToken(tokens.refresh_token);
      console.log("Waiting on new tokens...");
      if (newToken && newToken.data && newToken.data.access_token) {
        tokens = newToken.data;
        fs.writeFile(tokenPath, JSON.stringify(newToken.data), (err) => {
          if (err) {
            console.error(`Error in writing to ${tokenPath}: ${err}`);
          }
        });
        const setTokens = await yf.setUserToken(JSON.stringify(newToken.data.access_token));
        console.log("New tokens written to tokens.json.");
        getData();
        console.log("ran getData");
      }
    } else {
      console.error(
        `Error with credentials in makeAPIrequest()/refreshAuthorizationToken(): ${err}`
        );
    }
    console.log(err);
  }
};

// Read tokens.json
async function readCredentials() {
  try {
    // Check if tokens.json exists
    if (fs.existsSync(tokenPath)) {
      try {
        tokens =  await JSON.parse(fs.readFileSync(tokenPath, "utf8"));
      } catch (err) {
        console.error(`Error parsing tokens file ${tokenPath}: ${err}.`);
        process.exit();
      }
    } else {
      // Get initial authorization token
      const newToken = await getInitialAuthorization();
      if (newToken && newToken.data && newToken.data.access_token) {
        fs.writeFile(tokenPath, JSON.stringify(newToken.data), (err) => {
          if (err) {console.error(`Error in writing to ${tokenPath}: ${err}`)};
        })}
        tokens = newToken.data;
      }
    } catch (err) {
      console.error(`Error in readCredentials(): ${err}`);
    }
  }

// If token is expired, request new one
function refreshAuthorizationToken(refresh_token) {
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
      refresh_token: tokens.refresh_token,
    }),
  }).catch((err) => {
    console.error(`Error in refreshAuthorizationToken(): ${err}`);
  });
}


/* Makes a call to get the intial tokens using your manually pasted
YAHOOCLIENTSECRET, YAHOOAPPCODE, YAHOOCLIENTSECRET in your .env file */

function getInitialAuthorization () {
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
exports.readCredentials = readCredentials;
