const express = require("express");

const router = express.Router();

const wishlistController = require("../controllers/wishlistController");

const {
    isAuthenticated,
} = require("../middlewares/authMiddleware");


// ===============================
// Add Product to Wishlist
// ===============================
router.post(
    "/wishlist/add/:id",
    isAuthenticated,
    wishlistController.addToWishlist
);


// ===============================
// Wishlist Page
// ===============================
router.get(
    "/wishlist",
    isAuthenticated,
    wishlistController.showWishlist
);


// ===============================
// Remove from Wishlist
// ===============================
router.post(
    "/wishlist/remove/:productId",
    isAuthenticated,
    wishlistController.removeFromWishlist
);


// ===============================
// Move Wishlist Product to Cart
// ===============================
router.post(
    "/wishlist/move-to-cart/:productId",
    isAuthenticated,
    wishlistController.moveToCart
);


module.exports = router;