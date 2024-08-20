const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

// Get all payment methods for a user
exports.getPaymentMethods = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    // Retrieve the customer's Stripe details, including default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

    res.json({
      paymentMethods: paymentMethods.data,
      defaultPaymentMethodId: defaultPaymentMethodId,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: error.message });
  }
};


// Create a checkout session
exports.createCheckoutSession = async (req, res) => {
  console.log("Incoming request body:", req.body);
  const { cartItems, email, paymentMethodId } = req.body;

  console.log("Received cartItems:", cartItems);
  console.log("Received email:", email);
  console.log("Received paymentMethodId:", paymentMethodId);

  if (!email || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  let customerId;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.stripeCustomerId) {
      customerId = existingUser.stripeCustomerId;
    } else if (existingUser) {
      const customer = await stripe.customers.create({
        email,
        description: "New customer",
      });
      customerId = customer.id;

      existingUser.stripeCustomerId = customerId;
      await existingUser.save();
    } else {
      const customer = await stripe.customers.create({
        email,
        description: "New customer",
      });
      customerId = customer.id;

      const newUser = new User({
        email,
        stripeCustomerId: customerId,
      });
      await newUser.save();
    }

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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(cartItems),
      currency: "cad",
      customer: customerId,
      payment_method: paymentMethodId || undefined,
      payment_method_types: ["card"],
      description: "Order Description",
      setup_future_usage: "off_session",
    });

    res.json({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating Stripe Payment Intent:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add a new payment method
exports.addPaymentMethod = async (req, res) => {
  const { paymentMethodId } = req.body;
  const userId = req.user.id;

  try {
    console.log("Looking for user with ID:", userId);
    const user = await User.findById(userId);

    if (!user || !user.stripeCustomerId) {
      console.error("User or Stripe customer not found");
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    console.log("Attaching payment method to customer:", user.stripeCustomerId);
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    console.log("Setting default payment method for customer:", user.stripeCustomerId);
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log("Payment method added successfully");
    res.status(200).json({ message: "Payment method added successfully" });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.deletePaymentMethod = async (req, res) => {
  console.log("Delete request received for payment method:", req.params.paymentMethodId);
  console.log("User from req.user:", req.user); // Log the entire req.user object

  const userId = req.user.id; // Correctly extracting userId from req.user
  const paymentMethodId = req.params.paymentMethodId; // Correctly extracting paymentMethodId from req.params

  if (!userId) {
    console.error("User ID is undefined.");
    return res.status(404).json({ error: "User not found" });
  }

  try {
    console.log("Looking up user with ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      console.error("Stripe customer ID not found for user");
      return res.status(404).json({ error: "Stripe customer ID not found" });
    }

    console.log("User found, proceeding with detachment for customer ID:", user.stripeCustomerId);
    console.log("Attempting to detach payment method:", paymentMethodId);

    const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    console.log("Payment method detached:", detachedPaymentMethod);

    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: error.message });
  }
};


// Set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
  const paymentMethodId = req.params.paymentMethodId; // Extract paymentMethodId from req.params
  const userId = req.user.id; // Extract userId from req.user

  try {
    console.log("Setting default payment method for user ID:", userId);
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      console.error("User or Stripe customer not found");
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }

    console.log("Updating Stripe customer:", user.stripeCustomerId, "with default payment method:", paymentMethodId);
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.status(200).json({ message: "Default payment method set successfully" });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate the total order amount
function calculateOrderAmount(cartItems) {
  return Math.round(
    cartItems.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    ) * 100
  );
}
