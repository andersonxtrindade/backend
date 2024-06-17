const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/conversation-users', authenticateToken, messageController.getConversationUsers);
router.get('/conversation', authenticateToken, messageController.getConversation);
router.post('/send-message', authenticateToken, messageController.sendMessage);

module.exports = router;
