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

// yf.setUserToken("NCUnF6afphpsns1v.ZCSceUVB9fr.etwBQOB4DgS7HkSylHNFbr8ROEprjkHgv3fEh4d5hwXLYXcYyteX_m9yKTj3.BLC70g7iRPqe81s4Fzgh4QGmJQatzsATpj_9ExRADV9KYTOHESeEVHQY1W6mWsVgGIWKY_HD6ezyswTVtwFJILJbD04KC8vv6h3VzSZOy8A3rFVAgxQVAtgrQKNC7zA4sO2osTOlG5O9vjdmA7L8Az5zJzh6iP3.14cPKuGFxiKiEtHWtkEoIUlssNBR.l6O4mYDMFi.g8MEfTePo93oxUq877tjvWt.lmI5GEgryRXSAd.w_iEYtrUXnHOzw.ZSZkQtFOPwxJ1LBEODlBJfZ2sQggJsMnMVd5h6BvNv0dXgm5jtzhMRB1cmN3kbSyhh8sxh.Mx3FqY9WZB_I3TGngjlv6KQrgkkiVcD609XOLaRmyqH.s.AENezIYoqj9SLjz.RxPVxJPR9hyhIY8TvdKifJH6Iw1N98ko9RaF2k2D2dmoQy6ps0H4JOqHzoEEHZM5qAEzTPG5ya3igK0lEN8h5vSTO6BBH4rfqwrnCSXal4QJW2tca.usxxEg3DFSInLMFZbb18AOkRzJGzzP_3QSrIPeG3BWyyilDK1B0c_MdrDNuRFmBQLzPWFcxBuUuj0oqWiJ1PKQCWTx0ux8U_lUikxIdyRakW4ql4l2qdPSYaxv8nRvs0FCC4yJEE8dX2iHau1jqm_9LeopxJ0c2ihwsbQC3jLHo5iZh0yixUY8MG2qONeLpi_oikuxlAaQq14FZVYbmv9hdB0AsTmpL.sPtO6c9bBipQmR6d.JF8xwP1QSEmcGCzs3C2Dphb6NiEgE6pFI8IJY_cjdxLecC87wc3qnyxjMo51IdITF5dFI_wnyiIx4m2ghqg7kzQufwFDO8wwKWIItPAezFT4Vbzbd6AH4uuV7AmSKXi3OVwYLV9OYnJ_0gTz00Jk9ne_ajpyb3M.1ihtxS1AkoFMlnxmNQRPYKcHX7PClTrQGD7N");

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
// try {
//     // Read credentials file or get new authorization token
//     await readCredentials();

//     // If crededentials exist
//     if (tokens) {
//       const res = await makeAPIrequest(url);
//     }
//   } catch (err) {
//     console.error(`Error in getData(): ${err}`);
//   }
// };

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

// async function importTokens() {
//   try {
//     tokens = await fs.readFile("tokens.json")
//   } catch {
//     console.error('Error: ', error.message);
//   }
// };


// readTokens(function (err, data) {
//   tokens = JSON.parse(data);
//   console.log(tokens);
// });

//  // Hit the Yahoo Fantasy API
//   async function makeAPIrequest(url) {
//     let response;
//     try {
//       response = await axios({
//         url,
//         method: "get",
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//           "Content-Type": "application/x-www-form-urlencoded",
//           "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36",
//         },
//       });
//       const jsonData = JSON.parse(parser.toJson(response.data));
//       return jsonData;
//     } catch (err) {
//       if (err.response.data && err.response.data.error && err.response.data.error.description && err.response.data.error.description.includes("token_expired")) {
//         const newToken = await this.refreshAuthorizationToken(this.CREDENTIALS.refresh_token);
//         if (newToken && newToken.data && newToken.data.access_token) {
//           this.CREDENTIALS = newToken.data;
//           this.writeToFile(JSON.stringify(newToken.data), CONFIG.AUTH_FILE, "w");
//           return this.makeAPIrequest(url, newToken.data.access_token, newToken.data.refresh_token);
//         }
//       } else {
//         console.error(`Error with credentials in makeAPIrequest()/refreshAuthorizationToken(): ${err}`);
//       }
//       return err;
//     }
//   }

exports.getData = getData;
exports.readCredentials = readCredentials;
