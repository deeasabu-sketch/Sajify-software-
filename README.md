# Sajify: E-commerce Web Application

Sajify is a full-stack online shop for cosmetics, jewellery and electronics, built for a real shop in Dhaka, Bangladesh. Customers can browse and search products, save favorites, fill a cart and place Cash on Delivery orders. Admins and sub-admins manage products, orders and members from a dashboard.

**Live demo:** https://sajify.onrender.com/

## Features

**Customer side**
- Product catalog with categories, search and product detail pages
- Percentage discounts with original and offer price, plus live stock count
- Wishlist (favorites) and shopping cart with quantity
- Register, login and session-based authentication (passwords hashed with bcrypt)
- Checkout with shipping address (Cash on Delivery)
- Order history, order details and order success page
- Profile page, edit profile and change password
- About and Contact pages

**Admin side**
- Admin dashboard
- Add, edit and list products with image upload
- Order management
- Member list
- Role-based access: `user`, `admin` and `subadmin`
- Main admin can create and edit sub-admins and give each one permissions (`dashboard`, `products`, `orders`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime and server | Node.js, Express 5 |
| Database | MongoDB Atlas with Mongoose |
| Templating | EJS with express-ejs-layouts |
| Auth and sessions | express-session, bcrypt |
| File upload | Multer |
| Utilities | slugify, dotenv |
| Frontend | HTML, CSS, vanilla JavaScript |
| Hosting | Render |

## Project Structure

```
app.js              Express app and route setup
config/             Database connection
controllers/        Request handling (auth, cart, checkout, orders, admin ...)
middlewares/        Auth checks, role and permission checks, image upload
models/             Mongoose models (User, Product, Cart, Wishlist, Order)
routes/             Route definitions
views/              EJS pages, layouts and partials
public/             CSS, client-side JS, uploaded product images
```

## Run Locally

1. Install Node.js and create a free MongoDB Atlas cluster.
2. Clone the repo and install packages:
   ```
   git clone https://github.com/deeasabu-sketch/Sajify-software-.git
   cd Sajify-software-
   npm install
   ```
3. Create a `.env` file in the project root:
   ```
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=a_long_random_string
   ```
4. Start the app:
   ```
   npm run dev
   ```
   Then open http://localhost:3000

Never commit the `.env` file. It is already listed in `.gitignore`.

## Author

MD. Abu Saeed
