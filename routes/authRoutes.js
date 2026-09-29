const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// ===============================
// Register
// ===============================
router.get("/register", authController.showRegister);

router.post("/register", authController.registerUser);

// ===============================
// Login
// ===============================
// ===============================
// Custom Admin Login
// ===============================
router.get(
    "/admin/sajify",
    authController.showLogin
);
router.get("/login", authController.showLogin);

router.post("/login", authController.loginUser);

// ===============================
// Logout
// ===============================
router.get("/logout", authController.logout);

// ===============================
// User Dashboard
// ===============================
router.get(
  "/dashboard",
  isAuthenticated,
  authController.dashboard
);

// ===============================
// User Profile
// ===============================
router.get(
  "/profile",
  isAuthenticated,
  authController.profile
);

// ===============================
// Edit Profile Page
// ===============================
router.get(
  "/profile/edit",
  isAuthenticated,
  authController.editProfilePage
);

// ===============================
// Update Profile
// ===============================
router.post(
  "/profile/edit",
  isAuthenticated,
  authController.updateProfile
);
// ===============================
// Change Password
// ===============================
router.get(
  "/profile/change-password",
  isAuthenticated,
  authController.changePasswordPage
);

router.post(
  "/profile/change-password",
  isAuthenticated,
  authController.changePassword
);

module.exports = router;