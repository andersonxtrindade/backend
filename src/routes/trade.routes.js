const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.post('/', authenticateToken, tradeController.createTrade);
router.put('/:id', authenticateToken, tradeController.updateTrade);

module.exports = router;
