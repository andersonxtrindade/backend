const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, bookController.searchBooks);
router.get('/:id', authenticateToken, bookController.getBookById);
router.post('/', authenticateToken, bookController.createBook);
router.put('/:id', authenticateToken, tradeController.updateTrade);

module.exports = router;
