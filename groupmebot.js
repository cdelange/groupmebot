// Load .env file
require("dotenv").config();

// Load axios
const axios = require("axios");

// Array and switch/case funciton make it easy to add new commands
// Array of valid commands for GroupMe bot
const botCommands = [
  "@help",
  "@standings",
  "@pointsagainst",
  "@pointsfor",
  "@pointsdiff",
  "@biggestvictory",
  "@sackowatch",
  "@topscorers",
];

// GroupMe Bot ID stored in .env file
const token = process.env.GROUPMETOKEN;

// Formatting function for Yahoo API return object
function formatObj(yahooObj, command) {
  const currentWeek = yahooObj["current_week"];
  const standings = yahooObj.standings;

  // Switch/case for each valid command to be formatted differently
  switch (command) {
    case "@help":
      postMessage(
        "Here is a list of my commands: \n @help: \n @biggestvictory: \n @standings: \n @topscorers: \n @sackowatch: \n @pointsagainst: \n @pointsfor: \n @pointsdiff:"
      );
      break;

    case "@standings":
      let filteredStandings = standings
        .map((team) => {
          return (
            team.standings.rank +
            ". " +
            team.name +
            " " +
            "(" +
            team.standings.outcome_totals.wins +
            "-" +
            team.standings.outcome_totals.losses +
            ")"
          );
        })
        .join("\n");
      console.log(filteredStandings);
      postMessage(`Week ${currentWeek} Standings: \n` + filteredStandings);
      break;

    case "@biggestvictory ":
      break;

    case "@sackowatch":
      //using the week it is and the week playoffs start and the current standings, You can filter the teams who are still theoretically possible to get sacko and as the season goes on the ranked list will get smaller and smaller. It will show how many games out you are
      break;

    case "@pointsagainst":
      let sortedPointsAgainst = standings
        .sort((a, b) => {
          return b.standings.points_against - a.standings.points_against;
        })
        .map((team) => {
          return (
            standings.indexOf(team) +
            1 +
            ". " +
            team.name +
            " " +
            "(" +
            team.standings.points_against.toFixed(2) +
            ")"
          );
        })
        .join("\n");
      postMessage(
        `Week ${currentWeek} Points Against Standings: \n` + sortedPointsAgainst
      );
      break;

    case "@pointsfor":
      let sortedPointsFor = standings
        .sort((a, b) => {
          return (
            parseFloat(b.standings.points_for) -
            parseFloat(a.standings.points_for)
          );
        })
        .map((team) => {
          return (
            standings.indexOf(team) +
            1 +
            ". " +
            team.name +
            " " +
            "(" +
            parseFloat(team.standings.points_for).toFixed(2) +
            ")"
          );
        })
        .join("\n");
      postMessage(
        `Week ${currentWeek} Points For Standings: \n` + sortedPointsFor
      );
      break;

    case "@pointsdiff":
      let sortedPointsDiff = standings
        .sort((a, b) => {
          return (
            b.standings.points_for -
            b.standings.points_against -
            (a.standings.points_for - b.standings.points_against)
          );
        })
        .map((team) => {
          return (
            standings.indexOf(team) +
            1 +
            ". " +
            team.name +
            " " +
            "(" +
            (team.standings.points_for - team.standings.points_against).toFixed(
              2
            ) +
            ")"
          );
        })
        .join("\n");
      postMessage(
        `Week ${currentWeek} Points Differential Standings: \n` +
          sortedPointsDiff
      );
      break;
  }
}

// Determines if incoming message is a command
function commandListener(text, name) {
  for (let command of botCommands) {
    if (text === command) {
      return true;
    }
  }
  return false;
}

// Sends post request to GroupMe containing formatted text
async function postMessage(string) {
  try {
    console.log(string);
    let body = {
      bot_id: token,
      text: string,
    };
    const res = await axios.post("https://api.groupme.com/v3/bots/post", body);
  } catch (err) {
    console.error(err.message);
    // res.status(500).send("Server error");
  }
}

exports.commandListener = commandListener;
exports.formatObj = formatObj;
