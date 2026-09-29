const express = require("express");

const router = express.Router();

const checkoutController =
    require("../controllers/checkoutController");

// ===============================
// Checkout
// ===============================
router.get(
    "/checkout",
    checkoutController.showCheckout
);

// ===============================
// Place Order
// ===============================
router.post(
    "/checkout",
    checkoutController.placeOrder
);

// ===============================
// Order Success
// ===============================
router.get(
    "/order-success/:id",
    checkoutController.orderSuccess
);

module.exports = router;