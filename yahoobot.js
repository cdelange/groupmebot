// Load .env file
require("dotenv").config();

// Loads axios for auth requests
const axios = require("axios");
const fs = require("fs");
const qs = require("qs");
const YahooFantasy = require("yahoo-fantasy");

// Loads yahoo client ID and secret
const yahooClientId = process.env.YAHOOCLIENTID;
const yahooClientSecret = process.env.YAHOOCLIENTSECRET;
const yahooAuthCode = process.env.YAHOOAPPCODE;
const yahooAppId = process.env.YAHOOAPPID;
const leagueKey = process.env.LEAGUEKEY;
const AUTH_HEADER = Buffer.from(
  `${yahooClientId}:${yahooClientSecret}`,
  "binary"
).toString("base64");
const tokenPath = "./tokens.json";

let tokens = null;

const yf = new YahooFantasy(yahooAppId, yahooAuthCode);

const getData = async () => {
  try {
    yf.setUserToken(tokens.access_token);
    const standings = await yf.league.standings(leagueKey);
    console.log('standings retrieved');
    return standings;
  } catch (err) {
    if (err.description.includes("token_expired")) {
      const newToken = await refreshAuthorizationToken(
        tokens.refresh_token
      );
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
        tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
        // console.log(tokens);
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

// If token is expired, request new one NEED TO IMPORT TOKENS FIRST
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
      refresh_token:
        "ADHrY1_kk4L5JCRdgnzo7Eur.Ejw7ZmX_w18MQSdsp3_naDmK.b.IMrn64Vu",
    }),
  }).catch((err) => {
    console.error(`Error in refreshAuthorizationToken(): ${err}`);
  });
}

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
            code: yahooAuthCode,
            grant_type: 'authorization_code',
        })
        }).catch((err) => {
            console.error(`Error in getInitialAuthorization(): ${err}`);
        });
}


exports.getData = getData;
exports.readCredentials = readCredentials;
