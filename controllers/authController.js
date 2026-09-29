const User = require("../models/user");
const bcrypt = require("bcrypt");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.showRegister = (req, res) => {
  res.render("pages/auth/register", {
    title: "Register",
  });
};

// ===============================
// Register User
// ===============================
exports.registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // ===============================
    // Check Existing User
    // ===============================
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).render("pages/auth/register", {
        title: "Register",
        error: "Email or phone number already exists.",
      });
    }

    // ===============================
    // Hash Password
    // ===============================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===============================
    // Create Customer
    // ===============================
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,

      // Customer registration ALWAYS creates user
      role: "user",
      isMainAdmin: false,
      permissions: [],
    });

    // ===============================
    // Save User
    // ===============================
    await newUser.save();

    // ===============================
    // Registration Successful
    // ===============================
    return res.redirect("/login");
  } catch (error) {
    console.log("Registration Error:", error);

    return res.status(500).render("pages/auth/register", {
      title: "Register",
      error: "Registration failed. Please try again.",
    });
  }
};

exports.showLogin = (req, res) => {
  res.render("pages/auth/login", {
    title: "Login",
    query: req.query,
  });
};

exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.send("All fields are required.");
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.send("Invalid Email or Phone");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send("Incorrect Password");
    }
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMainAdmin: user.isMainAdmin || false,
      permissions: user.permissions || [],
    };
    console.log(req.session.user);
    // ===============================
    // Login Redirect
    // ===============================
    if (user.role === "admin" && user.isMainAdmin === true) {
      return res.redirect("/admin/dashboard");
    }

    if (user.role === "subadmin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.send("Server Error");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.dashboard = (req, res) => {
  res.render("pages/dashboard", {
    currentUser: req.session.user,
  });
};
// ===============================
// User Profile
// ===============================
exports.editProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("pages/editprofile", {
      title: "Edit Profile",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("pages/profile", {
      title: "My Profile",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.phone = req.body.phone;

    await user.save();

    req.session.user.name = user.name;
    req.session.user.email = user.email;

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to Update Profile");
  }
};
// ===============================
// Change Password Page
// ===============================
exports.changePasswordPage = (req, res) => {
  res.render("pages/change-password", {
    title: "Change Password",
  });
};

// ===============================
// Change Password
// ===============================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.send("All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return res.send("New password and confirm password do not match.");
    }

    const user = await User.findById(req.session.user._id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.send("Current password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    req.session.destroy(() => {
      res.redirect("/login?passwordChanged=true");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to Change Password");
  }
};
