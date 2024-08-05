const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  products: { type: Array, required: true },
  total: { type: Number, required: true },
  purchase_date: { type: Date, default: Date.now },
  address: { type: String, required: true },
  payment_intent: { type: String, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
