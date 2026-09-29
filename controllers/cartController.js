const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ===============================
// Add Product to Cart
// ===============================
exports.addToCart = async (req, res) => {
  try {
    const productId = req.params.id;

    // ===============================
    // Check Product Exists
    // ===============================
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // ===============================
    // Check Product Stock
    // ===============================
    if (product.stock <= 0) {
      return res.status(400).send("Product is out of stock");
    }

    // ==================================================
    // Requested Quantity
    // ==================================================
    const requestedQuantity = Number(req.body.quantity) || 1;

    if (requestedQuantity < 1) {
      return res.status(400).send("Invalid quantity");
    }

    if (requestedQuantity > product.stock) {
      return res
        .status(400)
        .send(`Only ${product.stock} item(s) available in stock`);
    }

    // ==================================================
    // GUEST CART
    // ==================================================
    if (!req.session.user) {
      if (!req.session.guestCart) {
        req.session.guestCart = [];
      }

      const existingItem = req.session.guestCart.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + requestedQuantity;

        if (newQuantity > product.stock) {
          return res
            .status(400)
            .send(`Only ${product.stock} item(s) available in stock`);
        }

        existingItem.quantity = newQuantity;
      } else {
        req.session.guestCart.push({
          product: productId,
          quantity: requestedQuantity,
        });
      }

      return res.redirect("/cart");
    }

    // ==================================================
    // LOGGED-IN USER CART
    // ==================================================
    let cart = await Cart.findOne({
      user: req.session.user._id,
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = new Cart({
        user: req.session.user._id,
        items: [],
      });
    }

    // Check if product already exists
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res
          .status(400)
          .send(`Only ${product.stock} item(s) available in stock`);
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
      });
    }

    await cart.save();

    res.redirect("/cart");
  } catch (error) {
    console.log("Add To Cart Error:", error);
    res.status(500).send("Failed to Add Product to Cart");
  }
};

// ===============================
// Show Cart
// ===============================
exports.showCart = async (req, res) => {
  try {
    // ==================================================
    // GUEST CART
    // ==================================================
    if (!req.session.user) {
      const guestCart = req.session.guestCart || [];

      const productIds = guestCart.map((item) => item.product);

      const products = await Product.find({
        _id: { $in: productIds },
      });

      const items = guestCart
        .map((cartItem) => {
          const product = products.find(
            (p) => p._id.toString() === cartItem.product.toString(),
          );

          if (!product) {
            return null;
          }

          return {
            product,
            quantity: cartItem.quantity,
          };
        })
        .filter(Boolean);

      const cart = {
        items,
        isGuest: true,
      };

      return res.render("pages/cart", {
        title: "Shopping Cart",
        cart,
      });
    }

    // ==================================================
    // LOGGED-IN USER CART
    // ==================================================
    const cart = await Cart.findOne({
      user: req.session.user._id,
    }).populate("items.product");

    res.render("pages/cart", {
      title: "Shopping Cart",
      cart,
    });
  } catch (error) {
    console.log("Show Cart Error:", error);
    res.status(500).send("Failed to Load Cart");
  }
};

// ===============================
// Increase Cart Item Quantity
// ===============================
exports.increaseQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;

    // ===============================
    // Check Product Exists
    // ===============================
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ===============================
    // Check Stock
    // ===============================
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // ==================================================
    // GUEST CART
    // ==================================================
    if (!req.session.user) {
      const guestCart = req.session.guestCart || [];

      const item = guestCart.find(
        (item) => item.product.toString() === productId,
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Product not found in cart",
        });
      }

      // Stock limit
      if (item.quantity >= product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available in stock`,
        });
      }

      item.quantity += 1;

      return res.json({
        success: true,
        quantity: item.quantity,
      });
    }

    // ==================================================
    // LOGGED-IN USER CART
    // ==================================================
    const cart = await Cart.findOne({
      user: req.session.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Stock limit
    if (item.quantity >= product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock`,
      });
    }

    item.quantity += 1;

    await cart.save();

    res.json({
      success: true,
      quantity: item.quantity,
    });
  } catch (error) {
    console.log("Increase Quantity Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to Increase Quantity",
    });
  }
};
// ===============================
// Decrease Cart Item Quantity
// ===============================
exports.decreaseQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;

    // ==================================================
    // GUEST CART
    // ==================================================
    if (!req.session.user) {
      const guestCart = req.session.guestCart || [];

      const item = guestCart.find(
        (item) => item.product.toString() === productId,
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Product not found in cart",
        });
      }

      if (item.quantity > 1) {
        item.quantity -= 1;

        return res.json({
          success: true,
          quantity: item.quantity,
          removed: false,
        });
      }

      req.session.guestCart = guestCart.filter(
        (item) => item.product.toString() !== productId,
      );

      return res.json({
        success: true,
        quantity: 0,
        removed: true,
      });
    }

    // ==================================================
    // LOGGED-IN USER CART
    // ==================================================
    const cart = await Cart.findOne({
      user: req.session.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;

      await cart.save();

      return res.json({
        success: true,
        quantity: item.quantity,
        removed: false,
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    res.json({
      success: true,
      quantity: 0,
      removed: true,
    });
  } catch (error) {
    console.log("Decrease Quantity Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to Decrease Quantity",
    });
  }
};

// ===============================
// Remove Product From Cart
// ===============================
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    // ==================================================
    // GUEST CART
    // ==================================================
    if (!req.session.user) {
      const guestCart = req.session.guestCart || [];

      req.session.guestCart = guestCart.filter(
        (item) => item.product.toString() !== productId,
      );

      return res.redirect("/cart");
    }

    // ==================================================
    // LOGGED-IN USER CART
    // ==================================================
    const cart = await Cart.findOne({
      user: req.session.user._id,
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    res.redirect("/cart");
  } catch (error) {
    console.log("Remove From Cart Error:", error);
    res.status(500).send("Failed to Remove Product");
  }
};
