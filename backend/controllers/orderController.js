// orderController.js
const Order = require("../models/Order");


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
  const { user_id, products, total, purchase_date, address, payment_intent } = req.body;
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
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
