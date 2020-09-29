# Yahoo Fantasy Football Bot

Version: 1.0.0

## About

A NodeJS Fantasy Football Bot that consumes the Yahoo Fantasy API using yahoo-fantasy module and custom OAuth2 authentication. JSON reponses are formated and posted to GroupMe using GroupMe's API. JSON tokens stored in AWS S3.

## Built With

* [Node](https://nodejs.org/)
* [Heroku](https://www.heroku.com/)

## Code Overview

## Dependencies

- [expressjs](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [aws-sdk](https://github.com/aws/aws-sdk-js) - JS API for interacting with AWS S3
- [axios](https://github.com/axios/axios) - Promise based HTTP client for making API requests
- [body-parser](https://github.com/expressjs/body-parser#readme) - For parsing incoming request bodies from GroupMe
- [dotenv](https://github.com/motdotla/dotenv#readme) - Loads environment variables from .env file
- [yahoo-fantasy](https://github.com/whatadewitt/yfsapi) - Wrapper for the Yahoo! Fantasy Sports API to make API requests simpler
- [qs](https://github.com/ljharb/qs) - Used to convert Yahoo OAuth2 request bodies into a parameter string in the url
- [nodemon](http://nodemon.io/) -Tool that restarts Node Application when file changes are detected in development
- [mocha](https://mochajs.org/) - Testing framework
- [chai](http://chaijs.com/) - Assertion library for testing
- [make-runnable](https://github.com/super-cache-money/make-runnable#readme) - For calling exported functions in the command line during development

## Application Structure

- `app.js` - The entry point to our application. This file defines our express app.
- `test/` - This folder contains our Mocha tests.
- `yahoobot.js` - This file contains all requests and interactions with the Yahoo Sports API.
- `groupmebot.js` - This file contains all requests and formatting functions pertaining to the GroupMe API.
- `s3.js` - This folder the functions for writing, reading, and confirming the existance of the tokens.json file stored in S3.

## Error Handling

Errors are handled mostly through Try/Catch statements and are logged to the console.

## Authentication

Requests are authenticated using a Bot ID for GroupMe and OAuth2 authentication for Yahoo Sports API. OAuth2 requires refreshing of the access token every hour. Inital Authorization requires some human interaction with the browser to grab the App Access Code.

## Set Up

Coming soon...

## Scripts

-  start: "node index.js"
-  run server: "nodemon index.js"


## Acknowledgements
These were both helpful repositories that I emulated in some of my Yahoo API calls. There repositories have great README's to help understand Yahoo's confusing API and whatadewitt's Node wrapper module for the API makes it a breeze to use. All I that was left for me to do was implement the OAuth2 processes.
-  [https://github.com/edwarddistel/yahoo-fantasy-baseball-reader](https://github.com/edwarddistel/yahoo-fantasy-baseball-reader)
-  [https://github.com/whatadewitt/yahoo-fantasy-sports-api](https://github.com/whatadewitt/yahoo-fantasy-sports-api)

## Bugs and Issues
This is a work in progress. Report any issues via the GitHub issues page!

## Licence

This project is available under the [MIT Licence](http://opensource.org/licenses/MIT)
