const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: `${first_name} ${last_name}`,
    });

    // Create a new user in the database with the Stripe customer ID
    const user = new User({
      username,
      password: hashedPassword,
      email,
      default_address,
      first_name,
      last_name,
      phone_number,
      stripeCustomerId: customer.id, // Store Stripe customer ID in the user record
      is_admin: is_admin || false, // Default to false if not provided
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(400).json({ message: err.message });
  }
};

// Sign-In Controller
exports.signIn = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Me Controller
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", exists: false });
    }
    res.json({ exists: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Username not found", exists: false });
    }
    res.json({ exists: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Update User Controller
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Users Controller
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete User Controller
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
