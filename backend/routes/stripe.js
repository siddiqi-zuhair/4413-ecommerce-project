const express = require("express");
const router = express.Router();
const {
  getPaymentMethods,
  createCheckoutSession,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} = require("../controllers/stripeController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Route to get payment methods for a user
router.get("/payment-methods/:userId", authenticateToken, getPaymentMethods);

// Route to create a checkout session
router.post("/create-checkout-session", authenticateToken, createCheckoutSession);

// Route to add a new payment method
router.post("/payment-methods/add", authenticateToken, addPaymentMethod);

// Route to delete a payment method
router.delete("/payment-methods/delete/:paymentMethodId", authenticateToken, deletePaymentMethod);

// Route to update default payment method
router.post("/payment-methods/default/:paymentMethodId", authenticateToken, setDefaultPaymentMethod);

module.exports = router;
