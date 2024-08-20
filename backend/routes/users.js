const express = require("express");
const {
  signIn,
  signUp,
  getMe,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  checkEmail,
  checkUsername,
  adminUpdateUser,
} = require("../controllers/userController");
const { authenticateToken, checkAdminRole } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/me", authenticateToken, getMe);
router.get("/", authenticateToken, checkAdminRole, getAllUsers); // Restrict access to all users list to admin
router.get("/:id", authenticateToken, checkAdminRole, getUserById); // Restrict access to specific user details to admin
router.patch("/me", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, checkAdminRole, deleteUser); // Restrict deletion to admin
router.get("/email/:email", checkEmail);
router.patch("/:id", authenticateToken, checkAdminRole, adminUpdateUser); // Ensure only admins can update users
router.get("/username/:username", checkUsername);

module.exports = router;
