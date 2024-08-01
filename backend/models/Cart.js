const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  products: { type: Array, required: true },
});

module.exports = mongoose.model("cart", cartSchema);
