const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ===============================
    // Product Name
    // ===============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ===============================
    // Slug
    // ===============================
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ===============================
    // Description
    // ===============================
    description: {
      type: String,
      required: true,
    },

    // ===============================
    // Original Price
    // ===============================
    price: {
      type: Number,
      required: true,
      min: 0,
    },


    // ===============================
    // Discount Percentage
    // Example: 20 = 20% OFF
    // ===============================
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ===============================
    // Final Discount Price
    // This will be calculated
    // from price + discountPercent
    // ===============================
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===============================
    // Category
    // ===============================
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Cosmetics", "Jewellery", "Food"],
    },

    // ===============================
    // Brand
    // ===============================
    brand: {
      type: String,
      default: "",
    },

    // ===============================
    // Stock
    // ===============================
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===============================
    // Product Image
    // ===============================
    image: {
      type: String,
      default: "default-product.jpg",
    },

    // ===============================
    // Featured Product
    // ===============================
    featured: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // Product Status
    // ===============================
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// Automatically Calculate Discount Price
// ==========================================
productSchema.pre("save", function (next) {
  const price = Number(this.price) || 0;
  const discountPercent = Number(this.discountPercent) || 0;

  if (price > 0 && discountPercent > 0) {
    this.discountPrice =
      price - (price * discountPercent) / 100;
  } else {
    this.discountPrice = price;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
