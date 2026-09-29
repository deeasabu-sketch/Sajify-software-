require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const dns = require("dns");
const connectDB = require("./config/database");

const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const Wishlist = require("./models/Wishlist");
const Cart = require("./models/Cart");
const checkoutRoutes = require("./routes/checkoutRoutes");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sajify_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      // Wishlist Count
      const wishlist = await Wishlist.findOne({
        user: req.session.user._id,
      });

      res.locals.wishlistCount = wishlist ? wishlist.products.length : 0;

      // Cart Count
      const cart = await Cart.findOne({
        user: req.session.user._id,
      });

      res.locals.cartCount = cart
        ? cart.items.reduce((total, item) => total + item.quantity, 0)
        : 0;
    } else {
      res.locals.wishlistCount = 0;
      res.locals.cartCount = 0;
    }

    next();
  } catch (error) {
    console.log(error);

    res.locals.wishlistCount = 0;
    res.locals.cartCount = 0;

    next();
  }
});

app.set("view engine", "ejs");

connectDB();

app.use("/", productRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", wishlistRoutes);
app.use("/", checkoutRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
