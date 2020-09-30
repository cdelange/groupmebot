# Yahoo Fantasy Football Bot

## About

A NodeJS Fantasy Football Bot that consumes the Yahoo Fantasy API using yahoo-fantasy module and custom OAuth2 authentication. JSON reponses are formated and posted to GroupMe using GroupMe's API. JSON tokens stored in AWS S3. This project really solidified my grasp of asynchronous programming in Javascript, promises, and the async/await keywords. I used https://cron-job.org/en/ to keep my Heroku app from idling 15/24 hours for fast bot response as well as to add scheduled commands.

## Built With

* [Node](https://nodejs.org/)
* [Heroku](https://www.heroku.com/)

## Tools Used

- [ngrok](https://ngrok.com/) - Allowed me to set my GroupMe bot's callback URI to an ngrok forwarding address that allowed me to develop and run my application locally, while being able to test it online.

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

### Ngrok
Download and get Ngrok up and running

### Yahoo API access:
1. Log in and create an Application here https://developer.yahoo.com/apps/create/
2. Fill out the application form
    - Application Name (Can be anything)
    - Application Type (Web Application)
    - Callback Domain (I did not use this, but set it to 'localhost:3000')
    - API Permissions (Fantasy Sports Read)
3. Create Application
4. Take note of the App ID `YAHOOAPPID`, Client ID `YAHOOCLIENTID`,and Client Secret `YAHOOCLIENTSECRET`
5. Replace your own Client ID in this URL https://api.login.yahoo.com/oauth2/request_auth?client_id=YOUR-CLIENT-ID-GOES-HERE&redirect_uri=oob&response_type=code&language=en-us amd navigate to this page.
6. Agree to allow access and take note of the access code `YAHOOACCESSCODE`

### GroupMe API access:
1. Sign in and go to the the GroupMe Dev page at https://dev.groupme.com/
2. Click the 'Bots' tab on the top of the page
3. Click 'Create Bot'
3. Name your bot and set your callback as either your ngrok address for local developement or your deployed sites address.
4. Take note of your bots ID `GROUPMETOKEN`

### AWS S3 access:

1. Log in to AWS and navigate to the console page at https://aws.amazon.com/console/
2. In the top left corner, click Services and choose S3 from the list of services under Storage.
3. Click 'Create bucket' and pick any name for your bucket that is valid.
4. Set up bucket without changing the default settings.
5. Go to the AWS Management Console
6. Hover over your company name in the top right menu and click "My Security Credentials"
7. Scroll to the "Access Keys" section
8. Click on "Create New Access Key"
9. Take note of both the Access Key ID `AWSID` and Secret Access Key `AWSSECRET`
10. Also take note of your buckets name `AWSBUCKETNAME`


### Part 2: Configure app

1. Clone this repo
2. In the repo directory type `npm install`
3. In a text editor, create a file named '.env' and add the following key/values:
    - `GROUPMETOKEN: example123`
    - `YAHOOCLIENTID: example123`
    - `YAHOOCLIENTSECRET: example123`
    - `YAHOOAPPCODE: example123`
    - `AWSID: example123`
    - `AWSSECRET: example123`
    - `AWSBUCKETNAME: example123`
    - `LEAGUEKEY:  example123`
          The League Key has three parts:
        - (1) a unique prefix Yahoo randomly assigns each season
        - (2) the string ".l." (that's a lowercase L)
        - (3) the unique ID of your league
        - E.g.: `398.l.123456`
        - To find out this number:
            - If it's 2020, the unique prefix for NFL is '399'

### Part 3: Run app

1. Now you should have the .env file set, all dependencies installed, and your GroupMe callback URL set to your ngrok address.
2. Navigate to the repo directory and run:
    ```
    > npm run server
    ```
3. Once the server is up and running, go to your GroupMe chat and send any command (E.g. '@help')
4. The program should run the intial authorization and return the standings to the GroupMe chat.
5. You now should have a 'tokens.json' file in your AWS S3 bucket! The application will refresh this file as needed.

## Scripts

-  `start`: "node index.js"
-  `run server`: "nodemon index.js"

## Current Commands

@help: Will show all commands and descriptions
@standings: Current standings
@sackowatch: Sacko implications
@pointsagainst: Points Against standings
@pointsfor: Points For standings
@pointsdiff: Point differential standings
@avgdiff: Average point differential

## Acknowledgements
These were both helpful repositories that I emulated in some of my Yahoo API calls. There repositories have great README's to help understand Yahoo's confusing API and whatadewitt's Node wrapper module for the API makes it a breeze to use. All I that was left for me to do was implement the OAuth2 processes.
-  [https://github.com/edwarddistel/yahoo-fantasy-baseball-reader](https://github.com/edwarddistel/yahoo-fantasy-baseball-reader)
-  [https://github.com/whatadewitt/yahoo-fantasy-sports-api](https://github.com/whatadewitt/yahoo-fantasy-sports-api)

## Bugs and Issues

This repo is functionality complete — PRs and issues welcome!

## Licence

This project is available under the [MIT Licence](http://opensource.org/licenses/MIT)
