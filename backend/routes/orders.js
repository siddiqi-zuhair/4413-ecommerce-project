const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrdersByUserId,
  createOrder,
  getOrderById,
} = require("../controllers/orderController");

router.get("/", getAllOrders);
router.get("/user/:id", getOrdersByUserId);
router.post("/", createOrder);
router.get("/:id", getOrderById);

module.exports = router;