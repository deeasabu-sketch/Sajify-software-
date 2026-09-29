const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ===============================
// Show Checkout Page
// ===============================
exports.showCheckout = async (req, res) => {
    try {
        // ===============================
        // Login Required
        // ===============================
        if (!req.session.user) {
            return res.redirect("/login");
        }

        // ===============================
        // Get Cart
        // ===============================
        const cart = await Cart.findOne({
            user: req.session.user._id,
        }).populate("items.product");

        // ===============================
        // Empty Cart
        // ===============================
        if (!cart || cart.items.length === 0) {
            return res.redirect("/cart");
        }

        // ===============================
        // Validate Stock
        // ===============================
        for (const item of cart.items) {
            if (!item.product) {
                return res.status(400).send(
                    "A product in your cart no longer exists."
                );
            }

            if (item.product.stock < item.quantity) {
                return res.status(400).send(
                    `Only ${item.product.stock} item(s) available for ${item.product.name}`
                );
            }
        }

        // ===============================
        // Calculate Total
        // ===============================
        const totalAmount = cart.items.reduce(
            (total, item) => {
                return (
                    total +
                    item.product.price * item.quantity
                );
            },
            0
        );

        // ===============================
        // Render Checkout
        // ===============================
        res.render("pages/checkout", {
            title: "Checkout",
            cart,
            totalAmount,
            currentUser: req.session.user,
        });

    } catch (error) {

        console.log(
            "Show Checkout Error:",
            error
        );

        res.status(500).send(
            "Failed to Load Checkout"
        );
    }
};


// ===============================
// Place Order
// ===============================
exports.placeOrder = async (req, res) => {
    try {

        // ===============================
        // Login Required
        // ===============================
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const {
            name,
            phone,
            address,
            city,
        } = req.body;

        // ===============================
        // Validate Shipping Information
        // ===============================
        if (
            !name ||
            !phone ||
            !address ||
            !city
        ) {
            return res.status(400).send(
                "All shipping fields are required."
            );
        }

        // ===============================
        // Get Cart
        // ===============================
        const cart = await Cart.findOne({
            user: req.session.user._id,
        }).populate("items.product");

        if (
            !cart ||
            cart.items.length === 0
        ) {
            return res.redirect("/cart");
        }

        // ===============================
        // Prepare Order Items
        // ===============================
        const orderItems = [];

        let totalAmount = 0;

        // ===============================
        // Check Stock + Calculate Total
        // ===============================
        for (const item of cart.items) {

            const product = item.product;

            if (!product) {
                return res.status(400).send(
                    "A product in your cart no longer exists."
                );
            }

            // Stock validation
            if (
                product.stock < item.quantity
            ) {
                return res.status(400).send(
                    `Only ${product.stock} item(s) available for ${product.name}`
                );
            }

            const price = product.price;

            const subtotal =
                price * item.quantity;

            totalAmount += subtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price,
                quantity: item.quantity,
                subtotal,
            });
        }

        // ===============================
        // Create Order
        // ===============================
        const order = new Order({
            user: req.session.user._id,

            items: orderItems,

            totalAmount,

            shippingAddress: {
                name,
                phone,
                address,
                city,
            },

            paymentMethod: "COD",

            orderStatus: "Pending",
        });

        // ===============================
        // Save Order
        // ===============================
        await order.save();

        // ===============================
        // Reduce Product Stock
        // ===============================
        for (const item of cart.items) {

            await Product.findByIdAndUpdate(
                item.product._id,
                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        // ===============================
        // Clear Cart
        // ===============================
        cart.items = [];

        await cart.save();

        // ===============================
        // Order Success
        // ===============================
        res.redirect(
            `/order-success/${order._id}`
        );

    } catch (error) {

        console.log(
            "Place Order Error:",
            error
        );

        res.status(500).send(
            "Failed to Place Order"
        );
    }
};


// ===============================
// Order Success
// ===============================
exports.orderSuccess = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const order =
            await Order.findOne({
                _id: req.params.id,
                user: req.session.user._id,
            }).populate("items.product");

        if (!order) {
            return res.status(404).send(
                "Order not found"
            );
        }

        res.render(
            "pages/order-success",
            {
                title: "Order Successful",
                order,
                currentUser:
                    req.session.user,
            }
        );

    } catch (error) {

        console.log(
            "Order Success Error:",
            error
        );

        res.status(500).send(
            "Failed to Load Order"
        );
    }
};