const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with the secret key from environment variables
const User = require("../models/User"); // Import the User model

// Get all payment methods for a user
exports.getPaymentMethods = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user in the database by their ID
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      // If the user or their Stripe customer ID is not found, return a 404 error
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    // List all card payment methods for the user's Stripe customer ID
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    // Retrieve the customer details from Stripe, including their default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

    // Respond with the list of payment methods and the default payment method ID
    res.json({
      paymentMethods: paymentMethods.data,
      defaultPaymentMethodId: defaultPaymentMethodId,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: error.message }); // Handle errors and send a 500 status code
  }
};

// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
  console.log("Incoming request body:", req.body);
  const { cartItems, email, paymentMethodId } = req.body;

  console.log("Received cartItems:", cartItems);
  console.log("Received email:", email);
  console.log("Received paymentMethodId:", paymentMethodId);

  // Validate the incoming request data
  if (!email || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  let customerId;

  try {
    // Check if the user already exists in the database by their email
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.stripeCustomerId) {
      // If the user exists and has a Stripe customer ID, use it
      customerId = existingUser.stripeCustomerId;
    } else if (existingUser) {
      // If the user exists but doesn't have a Stripe customer ID, create one
      const customer = await stripe.customers.create({
        email,
        description: "New customer",
      });
      customerId = customer.id;

      existingUser.stripeCustomerId = customerId;
      await existingUser.save(); // Save the updated user with the Stripe customer ID
    } else {
      // If the user does not exist, create a new user and Stripe customer
      const customer = await stripe.customers.create({
        email,
        description: "New customer",
      });
      customerId = customer.id;

      const newUser = new User({
        email,
        stripeCustomerId: customerId,
      });
      await newUser.save(); // Save the new user in the database
    }

    // If a payment method ID is provided, attach it to the Stripe customer and set it as the default
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create a payment intent with the order amount, currency, and customer ID
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(cartItems), // Calculate the total order amount
      currency: "cad",
      customer: customerId,
      payment_method: paymentMethodId || undefined,
      payment_method_types: ["card"],
      description: "Order Description",
      setup_future_usage: "off_session", // For future off-session payments
    });

    // Respond with the client secret of the payment intent
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating Stripe Payment Intent:", error);
    res.status(500).json({ error: error.message }); // Handle errors and send a 500 status code
  }
};

// Add a new payment method
exports.addPaymentMethod = async (req, res) => {
  const { paymentMethodId } = req.body;
  const userId = req.user.id;

  try {
    // Find the user in the database by their ID
    const user = await User.findById(userId);

    if (!user || !user.stripeCustomerId) {
      // If the user or their Stripe customer ID is not found, return a 404 error
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    // Attach the new payment method to the user's Stripe customer account
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set the new payment method as the default for future invoices
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.status(200).json({ message: "Payment method added successfully" });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({ error: error.message }); // Handle errors and send a 500 status code
  }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
  const userId = req.user.id; // Correctly extracting userId from req.user
  const paymentMethodId = req.params.paymentMethodId; // Correctly extracting paymentMethodId from req.params

  if (!userId) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    // Find the user in the database by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(404).json({ error: "Stripe customer ID not found" });
    }

    // Detach the payment method from the Stripe customer
    await stripe.paymentMethods.detach(paymentMethodId);

    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and send a 500 status code
  }
};

// Set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
  const paymentMethodId = req.params.paymentMethodId;
  const userId = req.body.userId; // Ensure userId is being passed in the request body

  try {
    console.log("Setting default payment method for user ID:", userId);
    // Find the user in the database by their ID
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      console.error("User or Stripe customer not found");
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    // Check if the payment method is already attached to the customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== user.stripeCustomerId) {
      // Attach the payment method to the customer if not already attached
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });
      console.log(`Payment method ${paymentMethodId} attached to customer ${user.stripeCustomerId}`);
    }

    // Update the Stripe customer to set the default payment method
    console.log("Updating Stripe customer:", user.stripeCustomerId, "with default payment method:", paymentMethodId);
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.status(200).json({ message: "Default payment method set successfully" });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({ error: error.message }); // Handle errors and send a 500 status code
  }
};

// Helper function to calculate the total order amount
function calculateOrderAmount(cartItems) {
  return Math.round(
    cartItems.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    ) * 100 // Multiply by 100 to convert to the smallest currency unit (cents)
  );
}
