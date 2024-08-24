const Product = require("../models/Product");
const mongoose = require("mongoose");

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Retrieve all products from the database
    res.json(products); // Respond with the list of products
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Get multiple products by ID
exports.getMultipleProductsById = async (req, res) => {
  try {
    // Get the IDs from the query parameters and split them into an array
    const ids = req.query.ids ? req.query.ids.split(",") : [];

    // Filter out invalid IDs to ensure only valid MongoDB ObjectIDs are used
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    // If no valid IDs are provided, return a 400 status code
    if (validIds.length === 0) {
      return res.status(400).json({ message: "No valid IDs provided" });
    }

    // Query the database for products with the valid IDs
    const products = await Product.find({ _id: { $in: validIds } });

    // If no products are found, return a 404 status code
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Return the found products
    res.json(products);
  } catch (err) {
    console.error("Error retrieving products:", err.message); // Log the error for debugging
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
    }
  }
};

// Get One Product by ID (middleware expected to load the product beforehand)
exports.getOneProduct = (req, res) => {
  res.json(res.product); // Respond with the product found by the middleware
};

// Update One Product by ID
exports.updateProductById = async (req, res) => {
  // Destructure the properties from the request body
  const { name, description, platform, quantity, price, photos, videos } =
    req.body;

  // Update the product properties if they are provided in the request body
  if (name != null) res.product.name = name;
  if (description != null) res.product.description = description;
  if (platform != null) res.product.platform = platform;
  if (quantity != null) res.product.quantity = quantity;
  if (price != null) res.product.price = price;
  if (photos != null) res.product.photos = photos;
  if (videos != null) res.product.videos = videos;

  try {
    // Save the updated product to the database
    const updatedProduct = await res.product.save();
    res.json(updatedProduct); // Respond with the updated product
  } catch (err) {
    res.status(400).json({ message: err.message }); // Handle errors and send a 400 status code
  }
};

// Create List of Products using IGDB API
exports.createProducts = async (req, res) => {
  try {
    // Clear the existing products in the database
    await Product.deleteMany({});

    // Fetch games data from the IGDB API
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID, // IGDB client ID from environment variables
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`, // IGDB access token from environment variables
        "Content-Type": "application/json",
      },
      body: "fields name, summary, screenshots.image_id, platforms.name, videos.video_id, cover.image_id; sort aggregated_rating desc; where first_release_date >= 1577836800 & first_release_date <= 1735689600 & category = 0; limit 100;", // IGDB API request body
    });

    const data = await response.json(); // Parse the JSON response from IGDB
    let products = [];

    // Map the IGDB game data to product objects for insertion into the database
    data?.map((game) => {
      const platforms = game.platforms?.map((platform) => platform.name) || [];
      const photos =
        game.screenshots?.map(
          (screenshot) =>
            `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`
        ) || [];
      const videos =
        game.videos?.map((video) => `youtube.com/embed/${video.video_id}`) ||
        [];
      const quantity = Math.floor(Math.random() * 50) + 10; // Random quantity between 10 and 59
      const prices = [19.99, 29.99, 49.99, 59.99, 79.99, 89.99, 99.99]; // Predefined price options
      const price = prices[Math.floor(Math.random() * prices.length)]; // Randomly select a price

      // Create a new product instance
      const product = new Product({
        name: game.name,
        description: game.summary,
        platform: platforms,
        quantity: quantity,
        cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`,
        price: price,
        photos: photos,
        videos: videos,
      });
      products.push(product); // Add the product to the list
    });

    // Insert the products into the database
    await Product.insertMany(products);
    res.status(201).json("Successfully created products"); // Respond with a success message
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Create a Product from Admin Input
exports.createProductFromAdmin = async (req, res) => {
  // Destructure product details from the request body
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

  // Create a new Product instance with the provided details
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
    const newProduct = await product.save(); // Save the new product to the database
    if (!res.headersSent) {
      res.status(201).json(newProduct); // Respond with the newly created product and a 201 status code
    }
  } catch (err) {
    console.error("Error creating product:", err.message); // Log the error for debugging
    if (!res.headersSent) {
      res.status(400).json({ message: err.message }); // Handle errors and send a 400 status code
    }
  }
};

// Delete One Product by ID
exports.deleteProductById = async (req, res) => {
  let product;
  try {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findByIdAndDelete(req.params.id); // Find and delete the product by its ID
    } else {
      return res.status(404).json({ message: "Product not found" }); // Respond with a 404 status code if the ID is invalid
    }
    res.json({ message: "Product deleted successfully" }); // Respond with a success message
  } catch (err) {
    console.error("Error deleting product:", err); // Log any errors for debugging
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};
