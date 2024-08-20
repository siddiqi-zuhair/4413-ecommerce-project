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
const {
  authenticateToken,
  checkAdminRole,
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/me", authenticateToken, getMe);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/me", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);
router.get("/email/:email", checkEmail);
router.patch("/:id", authenticateToken, checkAdminRole, adminUpdateUser);
router.get("/username/:username", checkUsername);
module.exports = router;
