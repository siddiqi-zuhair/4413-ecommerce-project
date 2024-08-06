const express = require("express");
const router = express.Router();
const User = require("../models/User");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
); // Replace with your Stripe secret key

router.get('/payment-methods/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      // Fetch the user from your database
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ error: 'User or Stripe customer not found' });
      }
  
      // List all payment methods for the Stripe customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card', // Filter by payment method type
      });
  
      res.json({ paymentMethods: paymentMethods.data });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/create-checkout-session", async (req, res) => {
    const { cartItems, email, paymentMethodId } = req.body; // Assume paymentMethodId is provided
  
    if (!email || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Invalid request data" });
    }
  
    let customerId;
  
    try {
      // Step 1: Create or retrieve a Stripe customer
      const existingUser = await User.findOne({ email });
  
      if (existingUser && existingUser.stripeCustomerId) {
        customerId = existingUser.stripeCustomerId;
      } else if (existingUser) {
        // Update existing user with Stripe customer ID
        const customer = await stripe.customers.create({
          email,
          description: "New customer",
        });
        customerId = customer.id;
  
        existingUser.stripeCustomerId = customerId;
        await existingUser.save();
      } else {
        // If no user exists, create a new one
        const customer = await stripe.customers.create({
          email,
          description: "New customer",
        });
        customerId = customer.id;
  
        // Save the new customer ID in your database along with other user info
        const newUser = new User({
          email,
          stripeCustomerId: customerId,
          // Add other user details here if needed (username, etc.)
        });
        await newUser.save();
      }
  
      // Step 2: Attach the payment method to the customer if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  
        // Optionally, set this payment method as the default for invoices
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
  
      // Step 3: Create a payment intent with the customer ID
      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(cartItems), // Implement this function to calculate the total amount
        currency: "cad",
        customer: customerId,
        payment_method: paymentMethodId || undefined, // Attach the payment method if provided
        payment_method_types: ["card"],
        description: "Order Description",
        setup_future_usage: 'off_session', // Save the payment method for future use
      });
  
      // Step 4: Send the client_secret back to the client
      res.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating Stripe Payment Intent:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

function calculateOrderAmount(cartItems) {
  // Calculate the total amount in cents
  //round to 0 decimal places
    return Math.round(cartItems.reduce((total, product) => total + product.price * product.quantity, 0) * 100);
}

module.exports = router;
