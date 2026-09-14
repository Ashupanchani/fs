require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const { seedProducts } = require('./controllers/productController');

const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
  // Check if database is empty, auto-seed products if so
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Database empty: Auto-seeding initial products from Public API...');
      await seedProducts();
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (supports built Vite React app or dev directory)
const frontendDist = path.join(__dirname, '../frontend/dist');
const frontendDir = fs.existsSync(frontendDist) ? frontendDist : path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// API Directory / Health check endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'Full-Stack E-Commerce API',
    assignment: 'CIA Assessment - Node.js + MongoDB',
    endpoints: {
      products: [
        'GET    /api/products          - Retrieve all products (supports ?category=&search=&sort=)',
        'GET    /api/products/:id      - Retrieve product details by ID',
        'POST   /api/products          - Create a new product',
        'PUT    /api/products/:id      - Update an existing product',
        'DELETE /api/products/:id      - Delete a product',
        'POST   /api/products/seed     - Fetch & seed products from Public Free API',
      ],
      cart: [
        'GET    /api/cart              - Retrieve user cart with calculated totals',
        'POST   /api/cart              - Add item to cart or increment quantity',
        'PUT    /api/cart/:productId   - Update item quantity in cart',
        'DELETE /api/cart/:productId   - Remove item from cart',
        'DELETE /api/cart              - Clear entire cart',
      ],
      orders: [
        'POST   /api/orders            - Checkout & create order from cart',
        'GET    /api/orders            - Retrieve all orders',
        'GET    /api/orders/:id        - Retrieve single order details',
        'PATCH  /api/orders/:id/status - Update order fulfillment status',
      ],
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Fallback for HTML5 client routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = fs.existsSync(path.join(frontendDist, 'index.html'))
      ? path.join(frontendDist, 'index.html')
      : path.join(__dirname, '../frontend', 'index.html');
    return res.sendFile(indexPath);
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 E-Commerce Server running on port ${PORT}`);
  console.log(`🌐 Local Web App: http://localhost:${PORT}`);
  console.log(`📡 API Documentation: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});
