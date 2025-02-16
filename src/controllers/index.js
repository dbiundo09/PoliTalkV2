const { checkTableExists } = require('../utils/dynamodb');
const { SignatureV4 } = require('@aws-sdk/signature-v4');
const { HttpRequest } = require('@aws-sdk/protocol-http');
const { Sha256 } = require('@aws-crypto/sha256-browser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const dynamoDB = require('../config/dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Create the DynamoDB Document Client
const docClient = DynamoDBDocumentClient.from(dynamoDB);

const healthCheck = (req, res) => {
  res.status(200).json({ status: 'ok' });
};

const helloWorld = (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
};

const checkTable = async (req, res, next) => {
  try {
    const tableName = req.params.tableName;
    const exists = await checkTableExists(tableName);
    res.json({ exists });
  } catch (error) {
    next(error);
  }
};

const refreshBills = async (req, res, next) => {
  try {
    const request = new HttpRequest({
      method: 'GET',
      protocol: 'https:',
      hostname: '5hee4pdjul.execute-api.us-east-1.amazonaws.com',
      path: '/default/refreshBills',
      headers: {
        host: '5hee4pdjul.execute-api.us-east-1.amazonaws.com'
      }
    });

    const signer = new SignatureV4({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
      region: 'us-east-1',
      service: 'execute-api',
      sha256: Sha256
    });

    const signedRequest = await signer.sign(request);

    // Convert signed request to axios config
    const response = await axios({
      method: 'GET',
      url: 'https://5hee4pdjul.execute-api.us-east-1.amazonaws.com/default/refreshBills',
      headers: signedRequest.headers
    });

    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

const submitBill = async (req, res, next) => {
  try {
    const { billName, billSummary } = req.body;
    
    const billItem = {
      id: uuidv4(), // Generate unique ID
      billName,
      billSummary,
      createdAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: 'billTable',
      Item: billItem
    });

    await docClient.send(command);

    // Send success response
    res.status(201).json({
      message: 'Bill submitted successfully',
      data: billItem
    });
  } catch (error) {
    console.error('Error submitting bill:', error);
    next(error);
  }
};

module.exports = {
  healthCheck,
  helloWorld,
  checkTable,
  refreshBills,
  submitBill
}; 