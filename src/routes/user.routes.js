const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage })

router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/', upload.single('imagem'), userController.createUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.post('/authenticate', userController.authenticateUser);

module.exports = router;
