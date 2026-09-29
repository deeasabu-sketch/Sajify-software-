
const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cartController");

// ===============================
// Add Product to Cart
// ===============================
router.post(
  "/cart/add/:id",
  cartController.addToCart
);

// ===============================
// Show Cart
// ===============================
router.get(
  "/cart",
  cartController.showCart
);

// ===============================
// Increase Quantity
// ===============================
router.post(
  "/cart/increase/:productId",
  cartController.increaseQuantity
);

// ===============================
// Decrease Quantity
// ===============================
router.post(
  "/cart/decrease/:productId",
  cartController.decreaseQuantity
);

// ===============================
// Remove From Cart
// ===============================
router.post(
  "/cart/remove/:productId",
  cartController.removeFromCart
);

module.exports = router;

