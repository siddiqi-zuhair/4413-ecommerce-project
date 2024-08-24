const Product = require("../models/Product");

// Middleware to find a product by ID and attach it to the response object
async function getProduct(req, res, next) {
  let product;
  try {
    // Attempt to find the product in the database using the ID from the request parameters
    product = await Product.findById(req.params.id);

    // If the product is not found, respond with a 404 status and an error message
    if (product == null) {
      return res.status(404).json({ message: "Cannot find product" });
    }
  } catch (err) {
    // If an error occurs (e.g., invalid ID format or database issues), respond with a 500 status and the error message
    return res.status(500).json({ message: err.message });
  }

  // Attach the found product to the response object for use in subsequent middleware or route handlers
  res.product = product;

  // Call the next middleware or route handler
  next();
}

// Export the middleware function for use in other parts of the application
module.exports = getProduct;
