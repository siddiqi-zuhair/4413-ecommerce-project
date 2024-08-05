const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
); // Replace with your Stripe secret key

router.post("/create-checkout-session", async (req, res) => {
  const { cartItems } = req.body; // Assume cartItems includes the products and their quantities

  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(cartItems), // Implement this function to calculate the total amount
      currency: "cad",
      payment_method_types: ["card"],
      description: "Order Description",
    });

    // Send the client_secret back to the client
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating Stripe Payment Intent:", error);
    res.status(500).json({ error: error.message });
  }
});

function calculateOrderAmount(cartItems) {
  // Calculate the total amount in cents
  return cartItems.reduce(
    (total, item) => total + item.price * item.ordered_quantity * 100,
    0
  );
}

module.exports = router;
