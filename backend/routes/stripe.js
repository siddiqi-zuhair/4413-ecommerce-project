const express = require("express");
const router = express.Router();
const {
  getPaymentMethods,
  createCheckoutSession,
} = require("../controllers/stripeController");

// Route to get payment methods for a user
router.get("/payment-methods/:userId", getPaymentMethods);

// Route to create a checkout session
router.post("/create-checkout-session", createCheckoutSession);

module.exports = router;
