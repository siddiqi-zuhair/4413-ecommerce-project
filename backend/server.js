require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(cors()); // Use the cors middleware
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000', // Your frontend URL
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
  
const usersRouter = require('./routes/users');
const productsRoute = require('./routes/products');
app.use('/users', usersRouter);
app.use('/products', productsRoute);

app.listen(5000, () => console.log('Server Started on port 5000'));
