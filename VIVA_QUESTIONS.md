# 🎓 Full-Stack E-Commerce Web Application (CIA Assignment Viva Guide)

Welcome to the comprehensive Oral / Viva Exam Preparation Guide for this Continuous Internal Assessment (CIA) project. This document contains key architectural explanations, endpoint breakdowns, and 25+ direct oral questions and answers tailored to faculty evaluations.

---

## 🏗️ 1. Project Overview & Architecture

### High-Level Architecture (MVC Pattern)
This application is built using the **MERN / MEN stack** (MongoDB, Express.js, Node.js) with a responsive Vanilla JS frontend:

1. **Client / Presentation Layer (`public/`)**:
   - `index.html`: Semantic HTML5 single-page structure.
   - `css/style.css`: Clean responsive CSS with design tokens and flexible grids.
   - `js/app.js`: Client-side state handling, dynamic DOM manipulation, and asynchronous HTTP communication via `fetch()`.
2. **Server / Application Layer (`server.js`, `routes/`, `controllers/`)**:
   - Built on **Node.js** runtime and **Express.js** web framework.
   - Routes direct incoming HTTP requests (`/api/products`, `/api/cart`, `/api/orders`) to appropriate controller functions.
   - Controllers execute business logic: input validation, status code assignment, stock management, and total computations.
3. **Database / Persistence Layer (`config/db.js`, `models/`)**:
   - **MongoDB**: NoSQL document database storing data in flexible JSON-like BSON documents.
   - **Mongoose**: Object Data Modeling (ODM) library defining schemas (`Product`, `Cart`, `Order`), data types, required constraints, and default values.

---

## 📡 2. Complete 15 RESTful Endpoints (CRUD Matrix)

| # | HTTP Method | Endpoint | CRUD | Purpose | Status Codes |
|---|-------------|----------|------|---------|--------------|
| **1** | `GET` | `/api/products` | **Read** | Retrieve all products (with category filter, search query, and sorting) | `200`, `500` |
| **2** | `GET` | `/api/products/:id` | **Read** | Retrieve single product details by MongoDB `_id` | `200`, `404`, `500` |
| **3** | `POST` | `/api/products` | **Create** | Create and store a new product in MongoDB | `201`, `400`, `500` |
| **4** | `PUT` | `/api/products/:id` | **Update** | Update product details (title, price, stock, etc.) | `200`, `400`, `404` |
| **5** | `DELETE` | `/api/products/:id` | **Delete** | Remove product from database | `200`, `404`, `500` |
| **6** | `POST` | `/api/products/seed` | **Create** | Fetch free public products from FakeStore API & bulk seed into DB | `201`, `500` |
| **7** | `GET` | `/api/cart` | **Read** | Retrieve cart items with populated product details and totals | `200`, `500` |
| **8** | `POST` | `/api/cart` | **Create** | Add item to cart or increment quantity if already present | `201`, `400`, `500` |
| **9** | `PUT` | `/api/cart/:productId` | **Update** | Update item quantity in the shopping cart | `200`, `400`, `404` |
| **10** | `DELETE` | `/api/cart/:productId` | **Delete** | Remove specific item from cart | `200`, `404`, `500` |
| **11** | `DELETE` | `/api/cart` | **Delete** | Clear entire shopping cart | `200`, `500` |
| **12** | `POST` | `/api/orders` | **Create** | Checkout: create order, deduct product stock, and clear cart | `201`, `400`, `500` |
| **13** | `GET` | `/api/orders` | **Read** | Retrieve order history | `200`, `500` |
| **14** | `GET` | `/api/orders/:id` | **Read** | Retrieve single order details | `200`, `404`, `500` |
| **15** | `PATCH` | `/api/orders/:id/status` | **Update** | Update order status (Pending, Shipped, Delivered, Cancelled) | `200`, `400`, `404` |

---

## 💡 3. Key Viva / Oral Exam Questions & Model Answers

### General & Architecture Questions

#### Q1: What is Node.js and why did you choose it for this backend?
> **Answer:** Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 JavaScript engine. It uses an **event-driven, non-blocking I/O model**, making it lightweight and highly efficient for data-intensive real-time applications like e-commerce where multiple concurrent HTTP requests occur.

#### Q2: What is Express.js?
> **Answer:** Express.js is a minimal and flexible web application framework for Node.js. It provides robust features for building web and mobile applications, including easy routing, middleware support, request and response manipulation, and static file serving.

#### Q3: What is the purpose of middleware in Express? Give examples from your project.
> **Answer:** Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the `next` function in the application's request-response cycle. In our project, we use:
> - `express.json()`: Parses incoming requests with JSON payloads into `req.body`.
> - `cors()`: Enables Cross-Origin Resource Sharing.
> - `express.static()`: Serves static frontend assets (HTML, CSS, JS) from the `public` directory.
> - Global Error Handling Middleware: Catches uncaught errors and returns formatted JSON responses with error status codes.

---

### Database & MongoDB Questions

#### Q4: Why did you choose MongoDB over a relational database like MySQL?
> **Answer:** MongoDB is a document-oriented NoSQL database. It stores data as BSON (Binary JSON) documents. For e-commerce, it provides:
> 1. **Schema flexibility:** Products in various categories can possess varying attributes without cumbersome schema migrations.
> 2. **Embedded documents:** Order items can be embedded directly within an Order document, preserving the snapshot of the item title and price at the exact moment of purchase.
> 3. **High read/write performance:** Fast queries and native JSON handling in JavaScript.

#### Q5: What is Mongoose and why is it used?
> **Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a schema-based solution to model application data, handles type casting, validation, query building, business logic hooks (middleware), and relationships between collections via `ref` and `.populate()`.

#### Q6: How does `.populate()` work in your Cart controller?
> **Answer:** In `models/Cart.js`, the `product` field stores a MongoDB `ObjectId` referencing the `Product` model. When calling `Cart.find().populate('product')`, Mongoose internally performs a join-like lookup in the `products` collection and replaces the `ObjectId` with the full product document (title, price, image, etc.).

---

### REST API & HTTP Questions

#### Q7: What are the principles of a RESTful API?
> **Answer:** REST (Representational State Transfer) is an architectural style based on:
> 1. **Client-Server separation**: UI and data management are decoupled.
> 2. **Statelessness**: Every request contains all information needed to process it; the server stores no client session context.
> 3. **Standard HTTP methods**: Using `GET`, `POST`, `PUT`, `PATCH`, `DELETE` appropriately.
> 4. **Uniform Resource Identifiers (URIs)**: Resources identified by logical URIs like `/api/products`.

#### Q8: What is the difference between `PUT` and `PATCH`?
> **Answer:**
> - **`PUT`**: Replaces the entire resource or requires the complete updated entity (e.g., updating all product fields in `/api/products/:id`).
> - **`PATCH`**: Modifies specific fields of an existing resource without altering the rest (e.g., in `/api/orders/:id/status`, only the `status` field is modified, leaving the customer info and line items intact).

#### Q9: What HTTP status codes does your API return?
> **Answer:**
> - `200 OK`: Successful retrieval or update (`GET`, `PUT`, `PATCH`, `DELETE`).
> - `201 Created`: Resource successfully created (`POST /api/products`, `POST /api/cart`, `POST /api/orders`).
> - `400 Bad Request`: Client validation error (missing required fields like price or customer address).
> - `404 Not Found`: Resource with given ID doesn't exist.
> - `500 Internal Server Error`: Unexpected server or database exception.

---

### Business Logic & Public API Questions

#### Q10: How do you integrate public free APIs for products?
> **Answer:** In `controllers/productController.js`, the `seedProducts` function performs an asynchronous HTTP request using native `fetch()` to `https://fakestoreapi.com/products?limit=12`. The incoming JSON is mapped to match our Mongoose `Product` schema, old records are cleaned using `Product.deleteMany()`, and the new items are persisted to our local MongoDB with `Product.insertMany()`. If the remote network is ever offline or rate-limited, an automated fallback dataset guarantees seamless operation.

#### Q11: Explain the step-by-step checkout workflow.
> **Answer:**
> 1. Client submits customer shipping details to `POST /api/orders`.
> 2. Server fetches current items in the cart with populated product data.
> 3. Server computes subtotal, 5% tax, and grand total.
> 4. An `Order` document is created storing order items, totals, customer data, and initial status (`Pending`).
> 5. Product stock quantities are decremented using Mongoose atomic operator `$inc: { stock: -quantity }`.
> 6. Cart is cleared with `Cart.deleteMany({})`.
> 7. The new order is returned with HTTP status `201 Created`.

---

## 🧪 4. Live Demonstration Steps for Examiners

To demonstrate your project during the viva:
1. **Show Server Startup**:
   ```bash
   node server.js
   ```
   Point out connection to MongoDB at `mongodb://127.0.0.1:27017/ecommerce_db`.
2. **Show the 15 APIs**:
   Open `http://localhost:5000/api` in the browser to show the raw API directory.
3. **Show Public API Seeding**:
   On the web app (`http://localhost:5000`), click **"🔄 Seed Public API Data"** to show real-time fetching and MongoDB insertion.
4. **Demonstrate Product CRUD (Admin)**:
   - Go to **Manage Products** tab.
   - Click **➕ Add New Product** -> fill title, price, category -> Save (Tests `POST /api/products`).
   - Click **✏️ Edit** on an item -> change price -> Save (Tests `PUT /api/products/:id`).
   - Click **🗑️ Delete** -> confirm deletion (Tests `DELETE /api/products/:id`).
5. **Demonstrate Cart & Checkout**:
   - Add items to cart from the Store catalog (Tests `POST /api/cart`).
   - Go to Cart tab, adjust quantity +/- (Tests `PUT /api/cart/:productId`).
   - Click **Proceed to Checkout**, fill customer details, confirm (Tests `POST /api/orders`).
6. **Demonstrate Orders & Status Update**:
   - Go to Orders tab.
   - Change order status dropdown from `Pending` to `Shipped` (Tests `PATCH /api/orders/:id/status`).
7. **Show the Viva Prep Tab**:
   Click **"📖 Viva Prep"** on the navbar to show the built-in reference table of all 15 endpoints and viva question answers.
