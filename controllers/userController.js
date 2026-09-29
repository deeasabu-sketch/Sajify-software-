const Order = require("../models/Order");
exports.dashboard = (req, res) => {
  res.render("pages/dashboard", {
    title: "Dashboard",
    currentUser: req.session.user,
  });
};

exports.profile = (req, res) => {
  res.render("pages/profile", {
    title: "My Profile",
    currentUser: req.session.user,
  });
};

exports.orders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.session.user._id,
        })
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.render("pages/orders", {
            title: "My Orders",
            orders,
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to Load Orders");
    }
};

exports.wishlist = (req, res) => {
  res.render("pages/wishlist", {
    title: "Wishlist",
    currentUser: req.session.user,
  });
};

exports.cart = (req, res) => {
  res.render("pages/cart", {
    title: "Shopping Cart",
    currentUser: req.session.user,
  });
};
const User = require("../models/user");

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    res.render("pages/profile", {
      title: "My Profile",
      user,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard");
  }
  exports.profile = async (req, res) => {
    try {
      console.log(req.session.user);

      const user = await User.findById(req.session.user._id);

      console.log(user);

      res.render("pages/profile", {
        title: "My Profile",
        user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/dashboard");
    }
  };
};

// Edit Profile Page
exports.editProfilePage = async (req, res) => {
  const user = await User.findById(req.session.user._id);

  res.render("pages/editProfile", {
    title: "Edit Profile",
    user,
  });
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  await User.findByIdAndUpdate(req.session.user._id, {
    name,
    phone,
  });

  // Session Update
  req.session.user.name = name;

  res.redirect("/profile");
};
const bcrypt = require("bcrypt");


// Change Password Page
exports.changePasswordPage = (req, res) => {
  res.render("pages/changePassword", {
    title: "Change Password",
  });
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.session.user._id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.send("Current Password Incorrect");
  }

  if (newPassword !== confirmPassword) {
    return res.send("Password Doesn't Match");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  res.redirect("/profile");
};
