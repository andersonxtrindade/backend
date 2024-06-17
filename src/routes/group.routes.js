const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage })

router.post('/', authenticateToken, groupController.createGroup);
router.post('/post/', upload.single('image'), authenticateToken, groupController.createPost);
router.post('/react/', authenticateToken, groupController.createReact);
router.post('/comment/', authenticateToken, groupController.createComment);
router.get('/', authenticateToken, groupController.getGroups);
router.get('/:groupId/posts/', authenticateToken, groupController.getPostsByGroup);
router.get('/:groupId/', authenticateToken, groupController.getGroup);


module.exports = router;
