
const express = require("express");

const router = express.Router();

const productController =
    require("../controllers/productController");

// ===============================
// Home
// ===============================
router.get(
    "/",
    productController.home
);

// ===============================
// Shop
// ===============================
router.get(
    "/shop",
    productController.shop
);

// ===============================
// About
// ===============================
router.get(
    "/about",
    productController.about
);

// ===============================
// Contact Page
// ===============================
router.get(
    "/contact",
    productController.contact
);

// ===============================
// Contact Form Submit
// ===============================
router.post(
    "/contact",
    productController.submitContact
);

// ===============================
// Search Page
// ===============================
router.get(
    "/search",
    productController.searchProducts
);

// ===============================
// Home AJAX - Products
// ===============================
router.get(
    "/api/products",
    productController.getProducts
);

// ===============================
// Live AJAX Search
// ===============================
router.get(
    "/api/search",
    productController.liveSearch
);

// ===============================
// Product Details
// ===============================
router.get(
    "/product/:id",
    productController.productDetails
);

module.exports = router;

