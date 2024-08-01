const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getMultipleProductsById,
  getOneProduct,
  updateProductById,
  createProducts,
  createProductFromAdmin,
} = require("../controllers/productController");

const getProduct = require("../middlewares/getProduct");

router.get("/", getAllProducts);
router.get("/multiple", getMultipleProductsById);
router.get("/:id", getProduct, getOneProduct);
router.patch("/:id", getProduct, updateProductById);
router.post("/createProducts", createProducts);
router.post("/createProductFromAdmin", createProductFromAdmin);

module.exports = router;
