const express = require('express');
const router = express.Router();
const { healthCheck, helloWorld } = require('../controllers');

router.get('/health', healthCheck);
router.get('/hello', helloWorld);

module.exports = router; 