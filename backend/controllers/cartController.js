const Cart = require("../models/Cart");
const mongoose = require("mongoose");

// Get all carts
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one cart by ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.id });
    if (!cart) {
      return res.status(404).json({ message: "Cannot find cart" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a cart
exports.createCart = async (req, res) => {
  const { user_id, products, totalPrice, dateOrdered } = req.body;
  const cart = new Cart({
    user_id,
    products,
    totalPrice,
    dateOrdered,
  });

  try {
    const newCart = await cart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a cart by ID
exports.updateCartById = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.id });
    if (!cart) {
      return res.status(404).json({ message: "Cannot find cart" });
    }

    const { user_id, products, totalPrice, dateOrdered } = req.body;

    if (user_id != null) cart.user_id = user_id;
    if (products != null) cart.products = products;
    if (totalPrice != null) cart.totalPrice = totalPrice;
    if (dateOrdered != null) cart.dateOrdered = dateOrdered;

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a cart by ID
exports.deleteCartById = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.id });
    if (!cart) {
      return res.status(404).json({ message: "Cannot find cart" });
    }
    await cart.remove();
    res.json({ message: "Deleted cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
