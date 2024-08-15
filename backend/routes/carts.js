const express = require("express");
const router = express.Router();
const {
  getAllCarts,
  getCartById,
  createCart,
  updateCartById,
  deleteCartById,
  getCartWithProducts,
  manageCart,
} = require("../controllers/cartController");

router.get("/", getAllCarts);
router.get("/:id", getCartById);
router.post("/", createCart);
router.patch("/:id", updateCartById);
router.delete("/:id", deleteCartById);
router.get("/user/:id", getCartWithProducts);
router.post("/manage/:id", manageCart);

module.exports = router;
