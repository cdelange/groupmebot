// Load .env file
require("dotenv").config();

// Loads fs for reading and writing tokens.json
const fs = require("fs");

// For reading and writing tokens.json to AWS S3
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWSID,
    secretAccessKey: process.env.AWSSECRET
});

async function uploadFile(fileContent) {
  try {
    // Setting up S3 upload parameters
    const params = {
        Bucket: process.env.AWSBUCKETNAME,
        Key: 'tokens.json', // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
  } catch (err) {
    console.log(err);
  }
};

async function readFile() {
  try{
    // Setting up S3 upload parameters
    const params = {
      Bucket: process.env.AWSBUCKETNAME,
      Key: "tokens.json"
      }
    const bufferedFile = await s3.getObject(params).promise();
    const tokens = bufferedFile.Body.toString('utf-8');
    return tokens;
  } catch(err) {
    console.log(err.message)
    return err;;
  }
}

async function fileExists() {
  try{
    // Setting up S3 upload parameters
    const params = {
      Bucket: process.env.AWSBUCKETNAME,
      Key: "tokens.json", // File name you want to save as in S3
    }
    let data = await s3.getObject(params).promise();
    return true;
  } catch(err) {
    if (err.message.includes("key does not exist")){
      return false;
    }
    console.log(err.message);
  }
}
// .Body.toString('utf-8')
exports.uploadFile = uploadFile;
exports.readFile = readFile;
exports.fileExists = fileExists;