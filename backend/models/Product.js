const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  platform: { type: Array, required: true },
  cover: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  photos: { type: Array, required: true },
  videos: { type: Array, required: true },
});

module.exports = mongoose.model("product", productSchema);
