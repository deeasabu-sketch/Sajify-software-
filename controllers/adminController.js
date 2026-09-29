const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const slugify = require("slugify");

// ===============================
// Show Add Product Page
// ===============================
exports.addProductPage = (req, res) => {
  res.render("pages/admin/addProduct", {
    title: "Add Product",
  });
};

// ===============================
// Store Product
// ===============================

const createUniqueSlug = async (name) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;

    counter++;
  }

  return slug;
};

exports.storeProduct = async (req, res) => {
  try {
    const slug = await createUniqueSlug(req.body.name);

    const price = Number(req.body.price) || 0;
    const discountPercent = Number(req.body.discountPercent) || 0;

    const product = new Product({
      name: req.body.name,
      slug: slug,
      category: req.body.category,
      price: price,
      discountPercent: discountPercent,
      brand: req.body.brand,
      description: req.body.description,
      stock: Number(req.body.stock) || 0,
      image: "/uploads/products/" + req.file.filename,
    });

    await product.save();

    res.redirect("/admin/products");
  } catch (error) {
    console.log("Store Product Error:", error);
    res.status(500).send("Failed to Save Product");
  }
};
// ===============================
// Product List
// ===============================
exports.productList = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render("pages/admin/products", {
      title: "Manage Products",
      products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal Server Error");
  }
};

// ===============================
// Show Edit Product Page
// ===============================
exports.showEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("pages/admin/edit-product", {
      title: "Edit Product",
      product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal Server Error");
  }
};

// ===============================
// Update Product
// ===============================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    product.name = req.body.name;
    product.category = req.body.category;
    product.price = Number(req.body.price) || 0;
    product.discountPercent = Number(req.body.discountPercent) || 0;
    product.description = req.body.description;
    product.stock = Number(req.body.stock) || 0;

    // New image
    if (req.file) {
      if (product.image) {
        const oldImageName = path.basename(product.image);

        const oldImagePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "products",
          oldImageName,
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.image = "/uploads/products/" + req.file.filename;
    }

    // pre("save") automatically calculates discountPrice
    await product.save();

    res.redirect("/admin/products");
  } catch (error) {
    console.log("Update Product Error:", error);
    res.status(500).send("Failed to Update Product");
  }
};
// ===============================
// Delete Product (AJAX)
// ===============================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    console.log("Product image from DB:", product.image);

    if (product.image) {
      const imageName = path.basename(product.image);

      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "products",
        imageName,
      );

      console.log("Image name:", imageName);
      console.log("Image path:", imagePath);
      console.log("Image exists:", fs.existsSync(imagePath));

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
// ===============================
// Admin Dashboard
// ===============================
exports.dashboard = async (req, res) => {
  try {
    // ===============================
    // Basic Statistics
    // ===============================
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    // ===============================
    // Total Sales
    // Cancelled orders excluded
    // ===============================
    const salesResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "Cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // ===============================
    // Recent Orders
    // ===============================
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // ===============================
    // Recent Products
    // ===============================
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ===============================
    // Render Dashboard
    // ===============================
    res.render("pages/admin/dashboard", {
      title: "Admin Dashboard",

      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,

      recentOrders,
      recentProducts,
    });

  } catch (error) {
    console.log("Admin Dashboard Error:", error);

    res.status(500).send(
      "Failed to Load Admin Dashboard"
    );
  }
};
// ===============================
// Admin Order List
// ===============================
exports.orderList = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });

    res.render("pages/admin/orders", {
      title: "Manage Orders",
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to Load Orders");
  }
};

// ===============================
// Update Order Status
// ===============================
// ===============================
// Update Order Status (AJAX)
// ===============================
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const newStatus = req.body.orderStatus;

    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    order.orderStatus = newStatus;

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully.",
      status: order.orderStatus,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to Update Order Status",
    });
  }
};

// =====================================
// Admin Members
// =====================================
exports.adminMembers = async (req, res) => {
  try {
    const admins = await User.find({
      role: {
        $in: ["admin", "subadmin"]
      }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.render("pages/admin/members", {
      title: "Admin Members",
      admins
    });

  } catch (error) {

    console.log("Admin Members Error:", error);

    res.status(500).send(
      "Failed to load admin members"
    );
  }
};

// =====================================
// Create Sub Admin Page
// =====================================
exports.createSubAdminPage = (req, res) => {
  res.render("pages/admin/create-subadmin", {
    title: "Create Sub Admin",
  });
};


// =====================================
// Create Sub Admin
// =====================================
exports.createSubAdmin = async (req, res) => {

  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
    permissions
  } = req.body;

  try {

    // ===============================
    // Required Fields
    // ===============================

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).render(
        "pages/admin/create-subadmin",
        {
          title: "Create Sub Admin",
          error: "All fields are required."
        }
      );
    }


    // ===============================
    // Password Match
    // ===============================

    if (password !== confirmPassword) {

      return res.status(400).render(
        "pages/admin/create-subadmin",
        {
          title: "Create Sub Admin",
          error: "Passwords do not match."
        }
      );

    }


    // ===============================
    // Check Existing User
    // ===============================

    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingUser) {

      return res.status(400).render(
        "pages/admin/create-subadmin",
        {
          title: "Create Sub Admin",
          error: "Email or phone number already exists."
        }
      );

    }


    // ===============================
    // Allowed Permissions
    // ===============================

    const allowedPermissions = [
      "dashboard",
      "products",
      "orders",
      "customers"
    ];


    // ===============================
    // Normalize Permissions
    // ===============================

    let selectedPermissions = [];

    if (Array.isArray(permissions)) {

      selectedPermissions =
        permissions.filter(permission =>
          allowedPermissions.includes(permission)
        );

    } else if (permissions) {

      if (allowedPermissions.includes(permissions)) {
        selectedPermissions = [permissions];
      }

    }


    // ===============================
    // Hash Password
    // ===============================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );


    // ===============================
    // Create Sub Admin
    // ===============================

    const newSubAdmin = new User({

      name,
      email,
      phone,

      password: hashedPassword,

      role: "subadmin",

      isMainAdmin: false,

      permissions: selectedPermissions

    });


    // ===============================
    // Save MongoDB
    // ===============================

    await newSubAdmin.save();


    // ===============================
    // Redirect
    // ===============================

    return res.redirect("/admin/members");


  } catch (error) {

    console.log(
      "Create Sub Admin Error:",
      error
    );

    return res.status(500).render(
      "pages/admin/create-subadmin",
      {
        title: "Create Sub Admin",
        error: "Failed to create sub admin."
      }
    );

  }
};

// =====================================
// Edit Sub Admin Page
// =====================================

exports.editSubAdminPage = async (req, res) => {
  try {

    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    }).select("-password");

    if (!subAdmin) {
      return res.status(404).send("Sub Admin not found");
    }

    res.render("pages/admin/edit-subadmin", {
      title: "Edit Sub Admin",
      subAdmin,
    });

  } catch (error) {

    console.log("Edit Sub Admin Page Error:", error);

    res.status(500).send("Failed to load Sub Admin");
  }
};


// =====================================
// Update Sub Admin
// =====================================

exports.updateSubAdmin = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      permissions,
      password,
      confirmPassword,
    } = req.body;


    // ===============================
    // Find ONLY Sub Admin
    // ===============================

    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!subAdmin) {
      return res.status(404).send(
        "Sub Admin not found"
      );
    }


    // ===============================
    // Check Duplicate Email / Phone
    // ===============================

    const existingUser = await User.findOne({
      $and: [
        {
          _id: {
            $ne: req.params.id,
          },
        },
        {
          $or: [
            { email },
            { phone },
          ],
        },
      ],
    });

    if (existingUser) {
      return res.status(400).send(
        "Email or phone number already exists."
      );
    }


    // ===============================
    // Allowed Permissions
    // ===============================

    const allowedPermissions = [
      "dashboard",
      "products",
      "orders",
      "customers",
    ];


    let selectedPermissions = [];


    if (Array.isArray(permissions)) {

      selectedPermissions =
        permissions.filter(permission =>
          allowedPermissions.includes(permission)
        );

    } else if (
      permissions &&
      allowedPermissions.includes(permissions)
    ) {

      selectedPermissions = [permissions];

    }


    // ===============================
    // Update Basic Information
    // ===============================

    subAdmin.name = name;
    subAdmin.email = email;
    subAdmin.phone = phone;

    subAdmin.permissions = selectedPermissions;


    // ===============================
    // Update Password Only If Given
    // ===============================

    if (password) {

      if (password !== confirmPassword) {

        return res.status(400).send(
          "Passwords do not match."
        );

      }

      subAdmin.password =
        await bcrypt.hash(password, 10);
    }


    await subAdmin.save();


    return res.redirect("/admin/members");

  } catch (error) {

    console.log(
      "Update Sub Admin Error:",
      error
    );

    return res.status(500).send(
      "Failed to update Sub Admin."
    );
  }
};


// =====================================
// Delete Sub Admin
// =====================================

exports.deleteSubAdmin = async (req, res) => {
  try {

    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: "Sub Admin not found.",
      });
    }


    // ===============================
    // Delete ONLY Sub Admin
    // ===============================

    await User.deleteOne({
      _id: req.params.id,
      role: "subadmin",
    });


    return res.json({
      success: true,
      message: "Sub Admin deleted successfully.",
    });

  } catch (error) {

    console.log(
      "Delete Sub Admin Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete Sub Admin.",
    });
  }
};