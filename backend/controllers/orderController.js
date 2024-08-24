// Import necessary models
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Function to retrieve all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.json(orders); // Respond with the list of orders
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Function to retrieve orders for a specific user by their user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.params.id }); // Find orders associated with the user ID
    res.json(orders); // Respond with the list of orders for that user
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Function to retrieve a specific order by its order ID
exports.getOrderById = async (req, res) => {
  // This string does nothing and should be a console log for debugging (optional)
  // console.log("getting order by id");

  try {
    const order = await Order.findById(req.params.id); // Find the order by its ID
    res.json(order); // Respond with the order details
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Function to get the most ordered products across all orders
exports.getMostOrderedProducts = async (req, res) => {
  try {
    const orders = await Order.find().lean(); // Fetch all orders and convert them to plain JavaScript objects using .lean()

    let products = {}; // Initialize an object to hold product IDs and their corresponding ordered quantities

    // Loop through each order and each product within the order to tally the quantities
    await Promise.all(
      orders.map(async (order) => {
        await Promise.all(
          order.products.map(async (product) => {
            if (products[product._id]) {
              products[product._id] += product.ordered_quantity; // If the product is already in the tally, add the quantity
            } else {
              products[product._id] = product.ordered_quantity; // If not, add the product with its initial quantity
            }
          })
        );
      })
    );

    // Get all unique product IDs from the tally
    const productIds = Object.keys(products);

    // Fetch product details from the database for the products found in the orders
    const productDetails = await Product.find({
      _id: { $in: productIds },
    }).lean(); // Use .lean() here to optimize performance

    // Convert product details to a map for easy lookup
    const productMap = new Map(
      productDetails.map((product) => [product._id.toString(), product])
    );

    // Filter, sort, and map products based on the total ordered quantity
    const sortedProducts = Object.keys(products)
      .filter((id) => productMap.has(id) && productMap.get(id).quantity > 0) // Only include products that are still in stock
      .sort((a, b) => products[b] - products[a]) // Sort products by ordered quantity in descending order
      .slice(0, 5) // Take the top 5 most ordered products
      .map((id) => ({
        ...productMap.get(id), // Include product details
        total_ordered_quantity: products[id], // Add the total ordered quantity to the response
      }));

    res.json(sortedProducts); // Respond with the sorted list of top products
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle errors and send a 500 status code
  }
};

// Function to retrieve the sales history, aggregated by purchase date
exports.getSalesHistory = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$purchase_date" }, // Group sales by the purchase date
          },
          totalSales: { $sum: "$total" }, // Sum up the total sales for each date
        },
      },
      { $sort: { _id: 1 } }, // Sort the results by date in ascending order
    ]);

    res.json(salesData); // Respond with the sales history
  } catch (error) {
    res.status(500).json({ error: "Error fetching sales history" }); // Handle errors and send a 500 status code
  }
};

// Function to create a new order
exports.createOrder = async (req, res) => {
  // Destructure order details from the request body
  const { user_id, products, total, purchase_date, address, payment_intent } =
    req.body;

  // Create a new Order instance with the provided details
  const order = new Order({
    user_id,
    products,
    total,
    purchase_date,
    address,
    payment_intent,
  });

  try {
    const newOrder = await order.save(); // Save the new order to the database

    // After creating the order, delete the user's cart to clear it
    await Cart.deleteOne({ user_id });

    // Reduce the quantity of each product in the database based on the ordered quantity
    products.forEach(async (product) => {
      const productInDB = await Product.findById(product._id); // Find the product in the database
      productInDB["quantity"] -= product["ordered_quantity"]; // Decrease the product's quantity
      await productInDB.save(); // Save the updated product back to the database
    });

    res.status(201).json(newOrder); // Respond with the newly created order and a 201 status code
  } catch (err) {
    res.status(400).json({ message: err.message }); // Handle errors and send a 400 status code
  }
};
