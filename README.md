# Full-Stack E-Commerce Web Application

This project is divided into dedicated **frontend** and **backend** folders for a clean, modular full-stack architecture.

---

## 📁 Project Structure

```
assignment-fs/
├── frontend/                     # Client-side presentation layer
│   ├── index.html                # Main SPA interface
│   ├── css/
│   │   └── style.css             # Vanilla CSS design system & responsive styling
│   └── js/
│       └── app.js                # Frontend controllers, API fetch client & DOM logic
│
├── backend/                      # Server-side REST API & database layer
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/              # Business logic controllers
│   │   ├── productController.js  # Product CRUD & public API seeder
│   │   ├── cartController.js     # Shopping cart operations
│   │   └── orderController.js    # Order checkout & status fulfillment
│   ├── models/                   # Mongoose database schemas
│   │   ├── Product.js            # Product schema with validation
│   │   ├── Cart.js               # Cart schema with calculated subtotal
│   │   └── Order.js              # Order schema with shipping & timeline
│   ├── routes/                   # Express route definitions
│   │   ├── productRoutes.js      # /api/products endpoints
│   │   ├── cartRoutes.js         # /api/cart endpoints
│   │   └── orderRoutes.js        # /api/orders endpoints
│   ├── .env                      # Environment variables (PORT, MONGODB_URI)
│   ├── server.js                 # Express server & static frontend serving
│   ├── test-apis.js              # Automated test suite (16 tests)
│   └── package.json              # Backend dependencies
│
├── package.json                  # Root orchestration scripts
├── VIVA_QUESTIONS.md             # Theoretical & viva assessment questions
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Dependencies are already installed in `backend/`. If you ever need to reinstall:
```bash
cd backend
npm install
```

### 2. Start the Application

You can start the server directly from the root folder or from `backend/`:

**From root folder:**
```bash
npm start
# or for auto-reloading dev mode:
npm run dev
```

**From `backend/` folder:**
```bash
cd backend
npm start
# or:
npm run dev
```

The application will be accessible at:
- **Web App:** [http://localhost:5000](http://localhost:5000)
- **API Directory:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Standalone Frontend Development (Optional)
If you prefer running the frontend using **Live Server** (e.g. port `5500` or `3000`), the frontend's API client will automatically direct all `/api` calls to `http://localhost:5000` with CORS preconfigured.

---

## 🧪 Running Automated Tests

To test all 16 endpoints across Products, Cart, and Orders:

**From root folder:**
```bash
npm run test-api
```

**From `backend/` folder:**
```bash
cd backend
npm run test-api
```
