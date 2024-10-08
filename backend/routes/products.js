const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getMultipleProductsById,
  getOneProduct,
  updateProductById,
  createProducts,
  createProductFromAdmin,
  deleteProductById,
} = require("../controllers/productController");

const getProduct = require("../middlewares/getProduct");
const { checkAdminRole } = require("../middlewares/authMiddleware");

router.get("/", getAllProducts);
router.get("/multiple", getMultipleProductsById);
router.get("/:id", getProduct, getOneProduct);
router.patch("/:id", getProduct, updateProductById);
router.post("/createProducts", createProducts);
router.post("/createProductFromAdmin", checkAdminRole, createProductFromAdmin);
router.delete("/:id", deleteProductById);

module.exports = router;
