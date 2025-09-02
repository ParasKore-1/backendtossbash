const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');
const { validateCoinFlip } = require('../middleware/validation');

// All game routes require authentication
router.use(auth);

// Play coin flip game
router.post('/coin-flip', validateCoinFlip, gameController.playCoinFlip);

// Get game history
router.get('/history', gameController.getGameHistory);

// Get game statistics
router.get('/stats', gameController.getGameStats);

module.exports = router; 