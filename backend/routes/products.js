const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // Use consistent naming
const mongoose = require("mongoose");

module.exports = router;

// Get All Products

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get multiple products by ID
router.get("/multiple", async (req, res) => {
  try {
    // Get IDs from the query parameter
    const ids = req.query.ids ? req.query.ids.split(",") : [];

    // Ensure IDs are in ObjectId format (optional validation)
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Fetch products by IDs
    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get One Product by ID

router.get("/:id", getProduct, (req, res) => {
  res.json(res.product); // Return the product object
});

// Update One Product by ID
router.patch("/:id", getProduct, async (req, res) => {
  const { name, description, platform, quantity, price, photos, videos } =
    req.body;

  if (name != null) {
    res.product.name = name;
  }
  if (description != null) {
    res.product.description = description;
  }
  if (platform != null) {
    res.product.platform = platform;
  }
  if (quantity != null) {
    res.product.quantity = quantity;
  }
  if (price != null) {
    res.product.price = price;
  }
  if (photos != null) {
    res.product.photos = photos;
  }
  if (videos != null) {
    res.product.videos = videos;
  }

  try {
    const updatedProduct = await res.product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create List of products using IGDB API
router.post("/createProducts", async (req, res) => {
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
});

async function getProduct(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.params.id);
    if (product == null) {
      return res.status(404).json({ message: "Cannot find product" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.product = product;
  next();
}
