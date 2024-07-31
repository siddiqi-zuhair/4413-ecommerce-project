const express = require('express');
const {
  signIn,
  signUp,
  getMe,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser
} = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signin', signIn);
router.post('/signup', signUp);
router.get('/me', authenticateToken, getMe);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/me', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
