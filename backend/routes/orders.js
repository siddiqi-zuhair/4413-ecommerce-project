const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrdersByUserId,
  createOrder,
  getOrderById,
  getMostOrderedProducts,
} = require("../controllers/orderController");

router.get("/", getAllOrders);
router.get("/user/:id", getOrdersByUserId);
router.post("/", createOrder);
router.get("/id/:id", getOrderById);
router.get("/popular", getMostOrderedProducts);  

module.exports = router;
