const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrdersByUserId,
  createOrder,
  getOrderById,
  getMostOrderedProducts,
  getSalesHistory
} = require("../controllers/orderController");

router.get("/", getAllOrders);
router.get("/user/:id", getOrdersByUserId);
router.post("/", createOrder);
router.get("/id/:id", getOrderById);
router.get("/popular", getMostOrderedProducts);  
router.get("/sales", getSalesHistory);

module.exports = router;
