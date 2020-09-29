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
- [aws-sdk](https://github.com/auth0/express-jwt) - Middleware for validating JWTs for authentication
- [axios](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [body-parser](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript
- [dotenv](https://github.com/blakehaswell/mongoose-unique-validator) - For handling unique validation errors in Mongoose.
- [yahoo-fantasy](https://github.com/jaredhanson/passport) - For handling user authentication
- [qs](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format
- [nodemon](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format
- [mocha](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format
- [chai](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format
- [make-runnable](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format

## Application Structure

- `app.js` - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also requires the routes and models we'll be using in the application.
- `config/` - This folder contains configuration for passport as well as a central location for configuration/environment variables.
- `routes/` - This folder contains the route definitions for our API.
- `models/` - This folder contains the schema definitions for our Mongoose models.

## Error Handling

In `routes/api/index.js`, we define a error-handling middleware for handling Mongoose's `ValidationError`. This middleware will respond with a 422 status code and format the response to have [error messages the clients can understand](https://github.com/gothinkster/realworld/blob/master/API.md#errors-and-status-codes)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two express middlewares in `routes/auth.js` that can be used to authenticate requests. The `required` middleware configures the `express-jwt` middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `req.payload` in the endpoint. The `optional` middleware configures the `express-jwt` in the same way as `required`, but will *not* return a 401 status code if the request cannot be authenticated.



## Scripts

-  start: "node index.js"
-  run server: "nodemon index.js"


## Acknowledgements
These were both helpful repositories that I emulated in some of my Yahoo API calls. There repositories have great README's to help understand Yahoo's confusing API and whatadewitt's Node wrapper module for the API makes it a breeze to use. All I that was left for me to do was implement the OAuth2 processes.
-  [https://github.com/edwarddistel/yahoo-fantasy-baseball-reader](https://github.com/edwarddistel/yahoo-fantasy-baseball-reader)
-  [https://github.com/whatadewitt/yahoo-fantasy-sports-api](https://github.com/whatadewitt/yahoo-fantasy-sports-api)

## Bugs and Issues
This is still V1 and a work in progress. Report any issues via the GitHub issues page!

## Licence

This project is available under the [MIT Licence](http://opensource.org/licenses/MIT)
