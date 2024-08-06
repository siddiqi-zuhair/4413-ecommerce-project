// orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { user_id, products, total, purchase_date, address, payment_intent } =
    req.body;
  const order = new Order({
    user_id,
    products,
    total,
    purchase_date,
    address,
    payment_intent,
  });
  try {
    const newOrder = await order.save();
    //delete cart after order is created
    await Cart.deleteOne({ user_id });
    console.log(products);
    console.log("order created");
    // reduce product quantity in database
    products.forEach(async (product) => {
      const productInDB = await Product.findById(product._id);
      productInDB["quantity"] -= product["ordered_quantity"];
      await productInDB.save();
    });
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
