require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Middleware
app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
app.use(express.json());

// Routes
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const cartsRouter = require("./routes/carts");
const stripeRouter = require("./routes/stripe");
const ordersRouter = require("./routes/orders");
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/carts", cartsRouter);
app.use("/stripe", stripeRouter);
app.use("/orders", ordersRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
