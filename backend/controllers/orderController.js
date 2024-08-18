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

exports.getOrderById = async (req, res) => {
  ("getting order by id");
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMostOrderedProducts = async (req, res) => {
  try {
    const orders = await Order.find().lean(); // Use .lean() to get plain JavaScript objects
    let products = {};

    // Collect all product quantities
    await Promise.all(
      orders.map(async (order) => {
        await Promise.all(
          order.products.map(async (product) => {
            if (products[product._id]) {
              products[product._id] += product.ordered_quantity;
            } else {
              products[product._id] = product.ordered_quantity;
            }
          })
        );
      })
    );

    // Get all unique product IDs
    const productIds = Object.keys(products);

    // Fetch all products from the database
    const productDetails = await Product.find({
      _id: { $in: productIds },
    }).lean(); // Use .lean() here as well

    // Convert product details to a map for quick lookup
    const productMap = new Map(
      productDetails.map((product) => [product._id.toString(), product])
    );

    // Filter, sort, and map products based on quantity in the database
    const sortedProducts = Object.keys(products)
      .filter((id) => productMap.has(id) && productMap.get(id).quantity > 0) // Keep only products in the database with quantity > 0
      .sort((a, b) => products[b] - products[a]) // Sort by ordered quantity
      .map((id) => ({
        ...productMap.get(id),
        total_ordered_quantity: products[id], // Add the total ordered quantity
      }));

    res.json(sortedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSalesHistory = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$purchase_date" },
          },
          totalSales: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sales history" });
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
