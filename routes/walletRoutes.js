const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const { validateWalletUpdate } = require('../middleware/validation');

// All wallet routes require authentication
router.use(auth);

// Get wallet balance
router.get('/balance', walletController.getWalletBalance);

// Get wallet transactions
router.get('/transactions', walletController.getWalletTransactions);

// Get wallet statistics
router.get('/stats', walletController.getWalletStats);

// Add money to wallet (for testing/demo)
router.post('/add-money', validateWalletUpdate, walletController.addMoney);

// Withdraw money from wallet
router.post('/withdraw', validateWalletUpdate, walletController.withdrawMoney);

module.exports = router; 