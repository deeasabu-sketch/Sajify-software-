const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// ===============================
// Show Checkout Page
// ===============================
exports.showCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.session.user._id,
    }).populate("items.product");

    // Cart doesn't exist
    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    const totalAmount = cart.items.reduce(
      (total, item) => {
        return total + item.product.price * item.quantity;
      },
      0
    );

    // Get checkout error
    const checkoutError = req.session.checkoutError || null;

    // Clear error after reading
    req.session.checkoutError = null;

    res.render("pages/checkout", {
      title: "Checkout",
      checkoutCart: cart,
      totalAmount,
      checkoutError,
      currentUser: req.session.user,
    });

  } catch (error) {
    console.log("Show Checkout Error:", error);
    res.status(500).send("Failed to Load Checkout");
  }
};

// ===============================
// Place Order
// ===============================
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.session.user._id,
    }).populate("items.product");

    // Cart doesn't exist
    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // ===============================
    // Check Stock
    // ===============================
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        req.session.checkoutError =
          "A product in your cart was not found.";

        return res.redirect("/checkout");
      }

      if (product.stock <= 0) {
        req.session.checkoutError =
          `${product.name} is currently out of stock.`;

        return res.redirect("/checkout");
      }

      if (item.quantity > product.stock) {
        req.session.checkoutError =
          `Only ${product.stock} ${product.name} available in stock.`;

        return res.redirect("/checkout");
      }
    }

    // ===============================
    // Create Order Items
    // ===============================
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    // ===============================
    // Calculate Total
    // ===============================
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    // ===============================
    // Create Order
    // ===============================
    const order = new Order({
      user: req.session.user._id,

      items: orderItems,

      totalAmount,

      shippingAddress: {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
      },

      paymentMethod: "COD",

      orderStatus: "Pending",
    });

    await order.save();

    // ===============================
    // Decrease Product Stock
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
    // Clear Guest Cart
    // ===============================
    req.session.guestCart = [];

    // ===============================
    // Order Success
    // ===============================
    res.redirect("/order-success");

  } catch (error) {
    console.log("Place Order Error:", error);

    req.session.checkoutError =
      "Something went wrong while placing your order.";

    res.redirect("/checkout");
  }
};

// ===============================
// Order Success Page
// ===============================
exports.orderSuccess = (req, res) => {
  res.render("pages/order-success", {
    title: "Order Successful",
    currentUser: req.session.user,
  });
};


// ===============================
// My Orders
// ===============================
exports.myOrders = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const orders = await Order.find({
            user: req.session.user._id,
        })
            .sort({
                createdAt: -1,
            });

        res.render("pages/orders", {
            title: "My Orders",
            orders,
            currentUser: req.session.user,
        });

    } catch (error) {

        console.log(
            "My Orders Error:",
            error
        );

        res.status(500).send(
            "Failed to Load Orders"
        );
    }
};


// ===============================
// Order Details
// ===============================
exports.orderDetails = async (req, res) => {
    try {

        if (!req.session.user) {
            return res.redirect("/login");
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.session.user._id,
        }).populate("items.product");

        if (!order) {
            return res.status(404).send(
                "Order not found"
            );
        }

        res.render("pages/order-details", {
            title: "Order Details",
            order,
            currentUser: req.session.user,
        });

    } catch (error) {

        console.log(
            "Order Details Error:",
            error
        );

        res.status(500).send(
            "Failed to Load Order"
        );
    }
};
