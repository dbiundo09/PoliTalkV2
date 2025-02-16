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
    
    console.log('Received request body:', req.body);
    
    const billItem = {
      id: uuidv4(),
      billName,
      billSummary,
      createdAt: new Date().toISOString()
    };

    console.log('Attempting to save bill item:', billItem);

    const command = new PutCommand({
      TableName: 'billTable',
      Item: billItem
    });

    try {
      await docClient.send(command);
      console.log('Successfully saved to DynamoDB');
    } catch (dbError) {
      console.error('DynamoDB Error:', {
        message: dbError.message,
        code: dbError.code,
        statusCode: dbError.statusCode,
        requestId: dbError.$metadata?.requestId
      });
      throw dbError;
    }

    res.status(201).json({
      message: 'Bill submitted successfully',
      data: billItem
    });
  } catch (error) {
    console.error('Error in submitBill:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
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