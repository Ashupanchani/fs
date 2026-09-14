# Full-Stack E-Commerce Web Application (React + TypeScript & Node.js Express + MongoDB)

A modern full-stack e-commerce application built with **React + TypeScript (Vite)** on the frontend and **Node.js Express + MongoDB** on the backend.

---

## 📁 Project Structure

```
assignment-fs/
├── frontend/                     # React + TypeScript Presentation Layer
│   ├── src/
│   │   ├── components/           # Reusable Modular Components
│   │   │   ├── Navbar.tsx        # Navigation bar with brand, tabs & cart counter
│   │   │   ├── CategoryFilter.tsx# Search input, sort & category pills
│   │   │   ├── ProductCard.tsx   # Reusable product card with stepper & actions
│   │   │   ├── ProductGrid.tsx   # Product catalog grid with loading skeleton
│   │   │   ├── ProductModal.tsx  # Product Add / Edit modal with validation
│   │   │   ├── CartView.tsx      # Cart line items & checkout form
│   │   │   ├── OrderHistory.tsx  # Order history & status fulfillment
│   │   │   ├── Toast.tsx         # Floating feedback notifications
│   │   │   └── Modal.tsx         # Accessible dialog overlay
│   │   ├── services/
│   │   │   └── api.ts            # Strongly-typed API client for 16 endpoints
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces (Product, Cart, Order, etc.)
│   │   ├── App.tsx               # Main application container
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Glassmorphic CSS design system
│   ├── index.html                # HTML entry point with Google Fonts
│   ├── vite.config.ts            # Vite config with /api proxy to backend:5000
│   ├── tsconfig.json             # TypeScript compiler configuration
│   └── package.json              # Frontend dependencies (React, TypeScript, Vite)
│
├── backend/                      # Node.js Express & MongoDB REST API Layer
│   ├── config/
│   │   └── db.js                 # Mongoose MongoDB connection
│   ├── controllers/              # MVC Controllers (Product, Cart, Order)
│   ├── models/                   # Mongoose Data Models (Product, Cart, Order)
│   ├── routes/                   # Express REST Route Handlers
│   ├── .env                      # Environment Variables (PORT, MONGODB_URI)
│   ├── server.js                 # Express server & static asset serving
│   ├── test-apis.js              # 16-endpoint automated test suite
│   └── package.json              # Backend dependencies
│
├── package.json                  # Root orchestration scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### 2. Run in Development Mode

Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 2 (Frontend React + TypeScript):**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173` (with hot module replacement & API proxy to port 5000)

*Or from the root directory:*
- `npm run backend` (starts backend)
- `npm run frontend` (starts frontend)

---

### 3. Build & Production Run

Build the React + TypeScript frontend bundle:
```bash
npm run build:frontend
```
This outputs compiled assets into `frontend/dist`. Then simply run:
```bash
npm start
```
The Express backend will serve the compiled React TypeScript application directly at `http://localhost:5000`.

---

## 🧪 Automated Testing

Run all 16 endpoint CRUD tests:
```bash
npm run test-api
```
