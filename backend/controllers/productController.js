const Product = require("../models/Product");
const mongoose = require("mongoose");

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get multiple products by ID
exports.getMultipleProductsById = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(",") : [];

    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get One Product by ID
exports.getOneProduct = (req, res) => {
  res.json(res.product);
};

// Update One Product by ID
exports.updateProductById = async (req, res) => {
  const { name, description, platform, quantity, price, photos, videos } =
    req.body;

  if (name != null) res.product.name = name;
  if (description != null) res.product.description = description;
  if (platform != null) res.product.platform = platform;
  if (quantity != null) res.product.quantity = quantity;
  if (price != null) res.product.price = price;
  if (photos != null) res.product.photos = photos;
  if (videos != null) res.product.videos = videos;

  try {
    const updatedProduct = await res.product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create List of products using IGDB API
exports.createProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: "fields name, summary, screenshots.image_id, platforms.name, videos.video_id, cover.image_id; sort aggregated_rating desc; where first_release_date >= 1577836800 & first_release_date <= 1735689600 & category = 0; limit 100;",
    });
    const data = await response.json();
    let products = [];

    data?.map((game) => {
      const platforms = game.platforms?.map((platform) => platform.name) || [];
      const photos =
        game.screenshots?.map((screenshot) => screenshot.image_id) || [];
      const videos = game.videos?.map((video) => video.video_id) || [];
      const quantity = Math.floor(Math.random() * 50) + 10;
      const prices = [19.99, 29.99, 49.99, 59.99, 79.99, 89.99, 99.99];
      const price = prices[Math.floor(Math.random() * prices.length)];

      const product = new Product({
        name: game.name,
        description: game.summary,
        platform: platforms,
        quantity: quantity,
        cover: game.cover.image_id,
        price: price,
        photos: photos,
        videos: videos,
      });
      products.push(product);
    });
    await Product.insertMany(products);
    res.status(201).json("Successfully created products");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProductFromAdmin = async (req, res) => {
  const {
    name,
    description,
    platform,
    cover,
    quantity,
    price,
    photos,
    videos,
  } = req.body;

  const product = new Product({
    name,
    description,
    platform,
    cover,
    quantity,
    price,
    photos,
    videos,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
