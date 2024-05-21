const express = require('express');
const router = express.Router();
const opinionController = require('../controllers/opinion.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.post('/', authenticateToken, opinionController.createOpinion);

module.exports = router;
