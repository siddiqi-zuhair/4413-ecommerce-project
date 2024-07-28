const express = require('express');
const { signIn, getMe } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signin', signIn);
router.get('/me', authenticateToken, getMe);

module.exports = router;
