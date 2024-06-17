const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const tradeController = require('../controllers/trade.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage })

router.get('/', authenticateToken, bookController.searchBooks);
router.get('/:id', authenticateToken, bookController.getBookById);
router.post('/', upload.single('image'), authenticateToken, bookController.createBook);
router.put('/:id', authenticateToken, bookController.updateTrade);

module.exports = router;
