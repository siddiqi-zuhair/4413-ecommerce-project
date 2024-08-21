require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
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

module.exports = app;
