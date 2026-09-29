const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

const {
    isAuthenticated,
} = require("../middlewares/authMiddleware");

// ===============================
// Checkout Page
// ===============================
router.get(
    "/checkout",
    isAuthenticated,
    orderController.showCheckout
);

// ===============================
// Place Order
// ===============================
router.post(
    "/checkout/place-order",
    isAuthenticated,
    orderController.placeOrder
);
// ===============================
// Order Success
// ===============================
router.get(
    "/order-success",
    isAuthenticated,
    orderController.orderSuccess
);

// ===============================
// Customer Orders
// ===============================

router.get(
    "/orders",
    orderController.myOrders
);

router.get(
    "/orders/:id",
    orderController.orderDetails
);

module.exports = router;
module.exports = router;