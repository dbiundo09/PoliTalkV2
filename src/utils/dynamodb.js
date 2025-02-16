const { DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const client = require('../config/dynamodb');

const checkTableExists = async (tableName) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
};

module.exports = {
  checkTableExists
}; 