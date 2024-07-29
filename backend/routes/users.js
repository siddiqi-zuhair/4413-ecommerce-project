const express = require('express');
const { signIn, signUp, getMe, getAllUsers } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signin', signIn);
router.post('/signup', signUp);
router.get('/me', authenticateToken, getMe);
router.get('/', getAllUsers); 

module.exports = router;
