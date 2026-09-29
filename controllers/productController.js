
const Product = require("../models/Product");
const mongoose = require("mongoose");

// ===============================
// Home
// ===============================
exports.home = async (req, res) => {
    try {

        // First 10 products
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .limit(10);

        const currentUser =
            req.session.user || null;

        res.render("pages/home", {
            products,
            currentUser
        });

    } catch (error) {

        console.error("Home Error:", error);

        res.status(500).send(
            "Internal Server Error"
        );
    }
};


// ===============================
// Product Details
// ===============================
exports.productDetails = async (req, res) => {
    try {

        const product =
            await Product.findById(req.params.id);

        if (!product) {

            return res
                .status(404)
                .send("Product not found");
        }

        res.render(
            "pages/product-details",
            {
                title: product.name,
                product
            }
        );

    } catch (error) {

        console.error(
            "Product Details Error:",
            error
        );

        res.status(500).send(
            "Internal Server Error"
        );
    }
};


// ===============================
// Search Products + Pagination
// ===============================
exports.searchProducts = async (req, res) => {
    try {

        const search =
            req.query.search?.trim() || "";

        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );

        const limit = 8;

        const skip =
            (page - 1) * limit;

        let query = {};


        // ===============================
        // Search
        // ===============================
        if (search) {

            const searchConditions = [

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];


            // Product MongoDB ID search
            if (
                mongoose.Types.ObjectId.isValid(search)
            ) {

                searchConditions.push({
                    _id: search
                });

            }


            query = {
                $or: searchConditions
            };
        }


        // ===============================
        // Count
        // ===============================
        const totalProducts =
            await Product.countDocuments(query);

        const totalPages =
            Math.ceil(
                totalProducts / limit
            );


        // ===============================
        // Products
        // ===============================
        const products =
            await Product.find(query)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit);


        res.render(
            "pages/search-results",
            {
                title: search
                    ? `Search: ${search}`
                    : "All Products",

                products,

                search,

                currentPage: page,

                totalPages,

                totalProducts
            }
        );

    } catch (error) {

        console.error(
            "Search Error:",
            error
        );

        res.status(500).send(
            "Search failed"
        );
    }
};


// ===============================
// Live AJAX Navbar Search
// ===============================
exports.liveSearch = async (req, res) => {
    try {

        const search =
            req.query.search?.trim() || "";


        if (!search) {

            return res.json([]);
        }


        const searchConditions = [

            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                category: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                brand: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            }

        ];


        // Product ID search
        if (
            mongoose.Types.ObjectId.isValid(search)
        ) {

            searchConditions.push({
                _id: search
            });

        }


        const products =
            await Product.find({
                $or: searchConditions
            })

            .select(
                "_id name price image category brand"
            )

            .sort({
                createdAt: -1
            })

            .limit(5);


        res.json(products);

    } catch (error) {

        console.error(
            "Live Search Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Live search failed"
        });
    }
};


// ===============================
// Home AJAX Products
// Pagination + Search
// ===============================
exports.getProducts = async (req, res) => {
    try {

        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );

        const limit = 10;

        const skip =
            (page - 1) * limit;


        const search =
            req.query.search?.trim() || "";


        let query = {};


        // ===============================
        // Search by:
        // ID
        // Name
        // Category
        // Brand
        // Description
        // ===============================
        if (search.length > 0) {

            const searchConditions = [

                // Product Name
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                // Category
                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },

                // Brand
                {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                },

                // Description
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];


            // ===============================
            // Product MongoDB ID
            // ===============================
            if (
                mongoose.Types.ObjectId.isValid(search)
            ) {

                searchConditions.push({
                    _id: search
                });

            }


            query = {
                $or: searchConditions
            };
        }


        // ===============================
        // Total Products
        // ===============================
        const totalProducts =
            await Product.countDocuments(query);


        // ===============================
        // Get Products
        // ===============================
        const products =
            await Product.find(query)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit);


        // ===============================
        // Total Pages
        // ===============================
        const totalPages =
            Math.max(
                Math.ceil(
                    totalProducts / limit
                ),
                1
            );


        // ===============================
        // Response
        // ===============================
        res.json({

            success: true,

            products,

            currentPage: page,

            totalProducts,

            totalPages,

            hasMore:
                page < totalPages

        });

    } catch (error) {

        console.error(
            "Get Products Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load products"

        });
    }
};


// ===============================
// Shop Page
// Search + Category + Sorting + Pagination
// ===============================
exports.shop = async (req, res) => {
    try {

        const search =
            req.query.search?.trim() || "";

        const category =
            req.query.category?.trim() || "";

        const sort =
            req.query.sort?.trim() || "newest";

        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );

        const limit = 8;

        const skip =
            (page - 1) * limit;

        let query = {};

        // ===============================
        // Search
        // ===============================
        if (search) {

            const searchConditions = [

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

            // Product ID Search
            if (
                mongoose.Types.ObjectId.isValid(search)
            ) {

                searchConditions.push({
                    _id: search
                });

            }

            query.$or = searchConditions;
        }

        // ===============================
        // Category Filter
        // ===============================
        const allowedCategories = [
            "Electronics",
            "Fashion",
            "Cosmetics",
            "Jewellery",
            "Food"
        ];

        if (
            category &&
            allowedCategories.includes(category)
        ) {

            query.category = category;

        }

        // ===============================
        // Sorting
        // ===============================
        let sortOption = {
            createdAt: -1
        };

        switch (sort) {

            case "price-low":
                sortOption = {
                    price: 1
                };
                break;

            case "price-high":
                sortOption = {
                    price: -1
                };
                break;

            case "name-az":
                sortOption = {
                    name: 1
                };
                break;

            case "newest":
            default:
                sortOption = {
                    createdAt: -1
                };
                break;
        }

        // ===============================
        // Count Products
        // ===============================
        const totalProducts =
            await Product.countDocuments(query);

        const totalPages = Math.max(
            Math.ceil(totalProducts / limit),
            1
        );

        // ===============================
        // Get Products
        // ===============================
        const products =
            await Product.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit);

        // ===============================
        // Render Shop
        // ===============================
        res.render("pages/shop", {

            title: "Shop",

            products,

            search,

            category,

            sort,

            currentPage: page,

            totalPages,

            totalProducts,

            currentUser:
                req.session.user || null

        });

    } catch (error) {

        console.error(
            "Shop Error:",
            error
        );

        res.status(500).send(
            "Failed to Load Shop"
        );
    }
};
// ===============================
// About Page
// ===============================
exports.about = (req, res) => {

    res.render("pages/about", {
        title: "About Sajify",
        currentUser: req.session.user || null
    });

};


// ===============================
// Contact Page
// ===============================
exports.contact = (req, res) => {

    res.render("pages/contact", {
        title: "Contact Us",
        currentUser: req.session.user || null,
        success: req.query.success || null
    });

};


// ===============================
// Contact Form Submit
// ===============================
exports.submitContact = (req, res) => {

    const {
        name,
        email,
        subject,
        message
    } = req.body;

    // ===============================
    // Validation
    // ===============================
    if (
        !name ||
        !email ||
        !subject ||
        !message
    ) {
        return res.status(400).render(
            "pages/contact",
            {
                title: "Contact Us",
                currentUser:
                    req.session.user || null,
                error:
                    "All fields are required."
            }
        );
    }

    // ===============================
    // Temporary Contact Handling
    // ===============================
    console.log("========== CONTACT MESSAGE ==========");

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Subject:", subject);
    console.log("Message:", message);

    console.log("=====================================");

    // ===============================
    // Success
    // ===============================
    res.redirect(
        "/contact?success=Message%20sent%20successfully"
    );
};

