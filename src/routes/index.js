// src/routes/index.js
const express = require('express');
const router = express.Router();
const { 
  healthCheck, 
  helloWorld, 
  checkTable, 
  refreshBills, 
  submitBill,
  deleteBill
} = require('../controllers');

router.get('/health', healthCheck);
router.get('/hello', helloWorld);
router.get('/table/:tableName/exists', checkTable);
router.get('/bills/refresh', refreshBills);
router.post('/submit-bill', submitBill);
router.delete('/bills/deleteBill/:billId', deleteBill);

module.exports = router; 