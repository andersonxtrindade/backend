const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.post('/', authenticateToken, groupController.createGroup);
router.post('/post/', authenticateToken, groupController.createPost);
router.post('/react/', authenticateToken, groupController.createReact);
router.post('/comment/', authenticateToken, groupController.createComment);

module.exports = router;
