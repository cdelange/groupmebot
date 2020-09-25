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

// GroupMe Bot ID that you manunally pasted and stored in .env file
const token = process.env.GROUPMETOKEN;

// Help command function
function helpMessage() {
  postMessage(
    "Here is a list of my commands: \n @help: Will show all commands and descriptions \n @biggestvictory: Biggest margin of victory from previous week \n @standings: Current standings \n @topscorers: Top scoring players from previous week \n @sackowatch: Sacko implications \n @pointsagainst: Points Against standings \n @pointsfor: Points For standings \n @pointsdiff: Point differential standings"
  );
}


// Formatting function for Yahoo API return object
function formatObj(yahooObj, command) {
  const currentWeek = yahooObj["current_week"];
  const standings = yahooObj.standings;

  // Switch/case for each valid command to be formatted differently
  switch (command) {
    case "@standings":
      let filteredStandings = standings.map((team) => {
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
      });
      filteredStandings.splice(6, 0, "---------------------------------");
      console.log("Calling postMessage to send off formatted message to GroupMe");
      postMessage(
        `Week ${currentWeek} Standings: \n` + filteredStandings.join("\n")
      );
      break;

    case "@biggestvictory ":
      break;

    case "@sackowatch":
      //using the week it is and the week playoffs start and the current standings, You can filter the teams who are still theoretically possible to get sacko and as the season goes on the ranked list will get smaller and smaller. It will show how many games out you are

      // Reverse, slices to first 6 elements and formats text
      let sackoStandings = standings
        .reverse()
        .slice(0, 6)
        .map((team) => {
          return (
            standings.indexOf(team) +
            1 +
            ". " +
            team.name +
            " " +
            "(" +
            team.standings.outcome_totals.wins +
            "-" +
            team.standings.outcome_totals.losses +
            ")"
          );
        });

      // Adds in divider for sacko bowl
      sackoStandings.splice(2, 0, "---------------------------------");
      console.log(sackoStandings);
      postMessage(
        `Week ${currentWeek} Sacko Bowl Hunt: \n` + sackoStandings.join("\n")
      );
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
function commandListener(text) {
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
    // console.log(string);
    let body = {
      bot_id: token,
      text: string,
    };
    const request = await axios.post(
      "https://api.groupme.com/v3/bots/post",
      body
    );
  } catch (err) {
    console.error(err.message);
    request.status(500).send("Server error");
  }
}

exports.commandListener = commandListener;
exports.formatObj = formatObj;
exports.helpMessage = helpMessage;