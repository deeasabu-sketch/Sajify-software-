const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// ===============================
// Add Product to Wishlist
// ===============================
exports.addToWishlist = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        let wishlist = await Wishlist.findOne({
            user: req.session.user._id,
        });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.session.user._id,
                products: [],
            });
        }

        const alreadyExists = wishlist.products.some(
            id => id.toString() === productId
        );

        if (!alreadyExists) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.redirect("/wishlist");

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Add to Wishlist");
    }
};


// ===============================
// Show Wishlist
// ===============================
exports.showWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.session.user._id,
        }).populate("products");

        res.render("pages/wishlist", {
            title: "My Wishlist",
            wishlist,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Load Wishlist");
    }
};


// ===============================
// Remove Product from Wishlist
// ===============================
exports.removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.session.user._id,
        });

        if (!wishlist) {
            return res.status(404).send("Wishlist not found");
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== req.params.productId
        );

        await wishlist.save();

        res.redirect("/wishlist");

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Remove from Wishlist");
    }
};


// ===============================
// Add Wishlist Product to Cart
// ===============================
exports.moveToCart = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        let cart = await Cart.findOne({
            user: req.session.user._id,
        });

        if (!cart) {
            cart = new Cart({
                user: req.session.user._id,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                product: productId,
                quantity: 1,
            });
        }

        await cart.save();

        // Remove from wishlist
        const wishlist = await Wishlist.findOne({
            user: req.session.user._id,
        });

        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                id => id.toString() !== productId
            );

            await wishlist.save();
        }

        res.redirect("/cart");

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Move Product to Cart");
    }
};