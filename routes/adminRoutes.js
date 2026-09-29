const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const adminController = require("../controllers/adminController");
const {
  isAuthenticated,
  isAdmin,
  isMainAdmin,
  hasPermission,
} = require("../middlewares/authMiddleware");
// ===============================
// Admin Dashboard
// ===============================
router.get(
  "/admin/dashboard",
  isAuthenticated,
  isAdmin,
  hasPermission("dashboard"),
  adminController.dashboard
);

// ===============================
// Add Product Page
// ===============================
router.get(
  "/admin/products/add",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  adminController.addProductPage
);

// ===============================
// Add Product
// ===============================

router.post(
  "/admin/products/add",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  upload.single("image"),
  adminController.storeProduct
);

// ===============================
// Product List
// ===============================
router.get(
  "/admin/products",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  adminController.productList
);

// ===============================
// Edit Product Page
// ===============================
router.get(
  "/admin/edit-product/:id",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  adminController.showEditProduct
);

// ===============================
// Update Product
// ===============================
router.post(
  "/admin/edit-product/:id",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  upload.single("image"),
  adminController.updateProduct
);

// ===============================
// Delete Product
// ===============================
router.post(
  "/admin/delete-product/:id",
  isAuthenticated,
  isAdmin,
  hasPermission("products"),
  adminController.deleteProduct
);
// ===============================
// Admin Order List
// ===============================
router.get(
  "/admin/orders",
  isAuthenticated,
  isAdmin,
  hasPermission("orders"),
  adminController.orderList
);
// ===============================
// Update Order Status
// ===============================
router.post(
  "/admin/orders/:id/status",
  isAuthenticated,
  isAdmin,
  hasPermission("orders"),
  adminController.updateOrderStatus
);
// =====================================
// Admin Members
// =====================================

router.get(
  "/admin/members",
  isAuthenticated,
  isMainAdmin,
  adminController.adminMembers,
);

// =====================================
// Edit Sub Admin Page
// =====================================

router.get(
  "/admin/members/edit/:id",
  isAuthenticated,
  isMainAdmin,
  adminController.editSubAdminPage,
);


// =====================================
// Update Sub Admin
// =====================================

router.post(
  "/admin/members/edit/:id",
  isAuthenticated,
  isMainAdmin,
  adminController.updateSubAdmin,
);


// =====================================
// Delete Sub Admin
// =====================================

router.post(
  "/admin/members/delete/:id",
  isAuthenticated,
  isMainAdmin,
  adminController.deleteSubAdmin,
);
// =====================================
// Create Sub Admin
// =====================================

router.get(
  "/admin/members/create",
  isAuthenticated,
  isMainAdmin,
  adminController.createSubAdminPage,
);

router.post(
  "/admin/members/create",
  isAuthenticated,
  isMainAdmin,
  adminController.createSubAdmin,
);
module.exports = router;
