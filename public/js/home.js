document.addEventListener("DOMContentLoaded", () => {
    const productContainer =
        document.getElementById("productContainer");

    const prevPageBtn =
        document.getElementById("prevPageBtn");

    const nextPageBtn =
        document.getElementById("nextPageBtn");

    const pageInfo =
        document.getElementById("pageInfo");

    const searchInput =
        document.getElementById("productSearch");

    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = "";
    let isLoading = false;
    let searchTimer;


    // ===============================
    // Product Card
    // ===============================
    function createProductCard(product) {

        const hasDiscount =
            product.discountPercent > 0 &&
            product.discountPrice < product.price;

        return `
            <div class="col-6 col-md-4 col-lg-3 product-item">

                <div class="card h-100 shadow-sm position-relative product-card">

                    ${
                        hasDiscount
                            ? `
                                <span
                                    class="position-absolute top-0 start-0 badge bg-danger m-2"
                                    style="z-index: 2;"
                                >
                                    ${product.discountPercent}% OFF
                                </span>
                              `
                            : ""
                    }

                    <!-- Product Image -->
                    <div class="product-image-wrapper">

                        <img
                            src="${product.image}"
                            class="img-fluid product-hover-image"
                            alt="${product.name}"
                        >

                    </div>


                    <div class="card-body d-flex flex-column">

                        <!-- Product Name -->
                        <h5 class="card-title">
                            ${product.name}
                        </h5>


                        <!-- Category -->
                        <p class="text-muted mb-2">
                            ${product.category || ""}
                        </p>


                        <!-- Price -->
                        ${
                            hasDiscount
                                ? `
                                    <div class="mb-3">

                                        <span
                                            class="text-muted text-decoration-line-through me-2"
                                        >
                                            ৳ ${product.price}
                                        </span>

                                        <span class="text-success fw-bold">
                                            ৳ ${product.discountPrice}
                                        </span>

                                    </div>
                                  `
                                : `
                                    <h5 class="text-success mb-3">
                                        ৳ ${product.price}
                                    </h5>
                                  `
                        }


                        <!-- View Details -->
                        <a
                            href="/product/${product._id}"
                            class="btn btn-primary mt-auto"
                        >
                            View Details
                        </a>

                    </div>

                </div>

            </div>
        `;
    }


    // ===============================
    // Product Animation
    // ===============================
    function animateProducts() {

        const cards =
            document.querySelectorAll(".product-card");

        cards.forEach((card, index) => {

            card.classList.remove("product-animate");

            setTimeout(() => {

                card.classList.add("product-animate");

            }, index * 70);

        });
    }


    // ===============================
    // Load Products
    // ===============================
    async function loadProducts(page = 1) {

        if (isLoading) return;

        isLoading = true;

        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;

        try {

            const response = await fetch(
                `/api/products?page=${page}&search=${encodeURIComponent(currentSearch)}`
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }


            productContainer.innerHTML = "";


            // ===============================
            // No Products
            // ===============================
            if (!data.products.length) {

                productContainer.innerHTML = `
                    <div class="col-12 text-center py-5">

                        <h5 class="text-muted">
                            No products found
                        </h5>

                    </div>
                `;

            } else {

                data.products.forEach((product) => {

                    productContainer.insertAdjacentHTML(
                        "beforeend",
                        createProductCard(product)
                    );

                });

                // ===============================
                // Start Animation
                // ===============================
                animateProducts();
            }


            currentPage = data.currentPage;

            totalPages =
                Math.max(
                    Math.ceil(data.totalProducts / 10),
                    1
                );


            pageInfo.textContent =
                `Page ${currentPage} of ${totalPages}`;


            prevPageBtn.disabled =
                currentPage <= 1;

            nextPageBtn.disabled =
                currentPage >= totalPages;


        } catch (error) {

            console.error(
                "Product Load Error:",
                error
            );

        } finally {

            isLoading = false;

        }
    }


    // ===============================
    // Previous Page
    // ===============================
    prevPageBtn.addEventListener(
        "click",
        () => {

            if (currentPage > 1) {

                loadProducts(
                    currentPage - 1
                );

            }

        }
    );


    // ===============================
    // Next Page
    // ===============================
    nextPageBtn.addEventListener(
        "click",
        () => {

            if (currentPage < totalPages) {

                loadProducts(
                    currentPage + 1
                );

            }

        }
    );


    // ===============================
    // Featured Product Live Search
    // ===============================
    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                clearTimeout(searchTimer);

                searchTimer = setTimeout(
                    () => {

                        currentSearch =
                            searchInput.value.trim();

                        // Search always starts from Page 1
                        currentPage = 1;

                        loadProducts(1);

                    },
                    300
                );

            }
        );

    }


    // ===============================
    // Initial Load
    // ===============================
    loadProducts(1);

});