const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrdersByUserId,
  createOrder,
} = require("../controllers/orderController");

router.get("/", getAllOrders);
router.get("/user/:id", getOrdersByUserId);
router.post("/", createOrder);

module.exports = router;