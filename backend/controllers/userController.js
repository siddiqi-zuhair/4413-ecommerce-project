const User = require("../models/User");
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For creating and verifying JSON Web Tokens
const mongoose = require("mongoose"); // For MongoDB interactions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe for payment processing

// Sign-Up Controller
exports.signUp = async (req, res) => {
  const {
    username,
    password,
    email,
    first_name,
    default_address,
    last_name,
    phone_number,
    is_admin,
  } = req.body;
  try {
    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new Stripe customer for the user
    const customer = await stripe.customers.create({
      email: email,
      name: `${first_name} ${last_name}`,
    });

    // Create a new user in the database with the provided information and the Stripe customer ID
    const user = new User({
      username,
      password: hashedPassword,
      email,
      default_address,
      first_name,
      last_name,
      phone_number,
      stripeCustomerId: customer.id, // Store the Stripe customer ID
      is_admin: is_admin || false, // Default to false if not provided
    });

    const newUser = await user.save(); // Save the new user to the database
    res.status(201).json(newUser); // Respond with the created user
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(400).json({ message: err.message }); // Handle errors and send a 400 status code
  }
};

// Sign-In Controller
exports.signIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by their username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token with the user's ID and admin status
    const token = jwt.sign(
      { id: user._id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );
    res.json({ token }); // Respond with the JWT token
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Get Me Controller
exports.getMe = async (req, res) => {
  try {
    // Find the user by their ID from the JWT token, excluding the password field
    const user = await User.findById(req.user.id).select("-password");
    res.json(user); // Respond with the user data
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Check if an email already exists in the database
exports.checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "Email not found", exists: false });
    }
    res.json({ exists: true }); // Respond with the existence status
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Check if a username already exists in the database
exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "Username not found", exists: false });
    }
    res.json({ exists: true }); // Respond with the existence status
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Update User Controller
exports.updateUser = async (req, res) => {
  try {
    // Find the user by their ID from the JWT token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields if they are provided in the request body
    const {
      username,
      email,
      first_name,
      last_name,
      default_address,
      phone_number,
      password,
    } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (default_address) user.default_address = default_address;
    if (phone_number) user.phone_number = phone_number;
    if (password) {
      // If the password is provided, hash it before updating
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save(); // Save the updated user to the database
    res.json(user); // Respond with the updated user
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Admin Update User Controller
exports.adminUpdateUser = async (req, res) => {
  try {
    // Validate the user ID provided in the request parameters
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "User not found" });
    }
    // Find the user by their ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields if they are provided in the request body
    const {
      username,
      email,
      first_name,
      last_name,
      default_address,
      phone_number,
      password,
      is_admin,
    } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (default_address) user.default_address = default_address;
    if (phone_number) user.phone_number = phone_number;
    if (is_admin !== undefined) user.is_admin = is_admin;
    if (password) {
      // If the password is provided, hash it before updating
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save(); // Save the updated user to the database
    res.json(user); // Respond with the updated user
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Get All Users Controller
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Retrieve all users, excluding the password field
    res.json(users); // Respond with the list of users
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Delete User Controller
exports.deleteUser = async (req, res) => {
  try {
    // Find the user by their ID from the request parameters
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    User.findByIdAndDelete(req.params.id); // Delete the user from the database
    res.json({ message: "User deleted" }); // Respond with a success message
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Get User By ID Controller
exports.getUserById = async (req, res) => {
  try {
    // Find the user by their ID from the request parameters
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // Respond with the user data
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors and send a 500 status code
  }
};
