const Cart = require("../models/Cart");
const Product = require("../models/Product");
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
    // Filter out
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.manageCart = async (req, res) => {
  ("we are managing the cart");
  try {
    const cart = await Cart.findOne({ user_id: req.params.id });
    if (!cart) {
      const cart = new Cart({
        user_id: req.params.id,
        products: req.params.products,
      });
      const newCart = await cart.save();
      res.status(201).json(newCart);
    } else {
      const { products } = req.body;
      let newCart = cart.products;
      if (products != null) newCart = newCart.concat(products);
      const updatedCart = await Cart.findOneAndUpdate(
        { user_id: req.params.id },
        { products: newCart },
        { new: true }
      );
      res.json(updatedCart);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCartWithProducts = async (req, res) => {
  try {
    // Fetch the cart by user ID
    const cart = await Cart.findOne({ user_id: req.params.id });
    if (!cart) {
      return res.status(404).json({ message: "Cannot find cart" });
    }

    // Extract product IDs from the cart
    const productIds = cart.products.map((product) => product.id); // Assuming products array contains objects with `id`

    // Filter out invalid MongoDB ObjectIDs
    const validProductIds = productIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // Fetch products from the database using the valid product IDs
    const products = await Product.find({ _id: { $in: validProductIds } });

    // Combine cart products with the product details fetched
    const productsWithDetails = products.map((product) => {
      const cartItem = cart.products.find(
        (item) => item.id === product._id.toString()
      );
      return {
        ...product._doc, // Spread the product details
        ordered_quantity: cartItem ? cartItem.ordered_quantity : 1, // Merge with cart quantity
      };
    });

    // Respond with the cart id, user id, and combined product details and quantities
    res.json({
      _id: cart._id,
      user_id: cart.user_id,
      products: productsWithDetails,
    });
  } catch (err) {
    console.error("Error fetching cart with products:", err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the cart." });
  }
};
// Create a cart
exports.createCart = async (req, res) => {
  const { user_id, products } = req.body;
  const cart = new Cart({
    user_id,
    products,
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

    const { user_id, products } = req.body;

    if (products != null) cart.products = products;

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
    await cart.deleteOne();
    res.json({ message: "Deleted cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
