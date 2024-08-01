const express = require("express");
const router = express.Router();
const {
  getAllCarts,
  getCartById,
  createCart,
  updateCartById,
  deleteCartById,
} = require("../controllers/cartController");

router.get("/", getAllCarts);
router.get("/:id", getCartById);
router.post("/", createCart);
router.patch("/:id", updateCartById);
router.delete("/:id", deleteCartById);

module.exports = router;