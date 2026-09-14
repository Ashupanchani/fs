// State variables
let currentCategory = 'all';
let searchDebounceTimer = null;
let cachedProducts = [];

// Base API configuration: Automatically routes /api requests to backend (port 5000)
// whether served directly by Express or via standalone dev server (e.g., Live Server / port 5500)
const _originalFetch = window.fetch;
window.fetch = function (url, options) {
  if (typeof url === 'string' && url.startsWith('/api') && window.location.port !== '5000') {
    url = `http://localhost:5000${url}`;
  }
  return _originalFetch(url, options);
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCartCount();
});

// ==================== NOTIFICATIONS ====================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3500);
}

// ==================== TAB SWITCHER ====================
function switchTab(tabName) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active-view'));
  const activeView = document.getElementById(`view-${tabName}`);
  if (activeView) activeView.classList.add('active-view');

  // Load data for specific tab
  if (tabName === 'shop') loadProducts();
  if (tabName === 'cart') loadCart();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'manage') loadAdminProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== PRODUCTS (GET, FILTER, SEARCH) ====================
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const countText = document.getElementById('productResultsCount');
  const search = document.getElementById('searchInput').value.trim();
  const sort = document.getElementById('sortSelect').value;

  countText.textContent = 'Fetching products from MongoDB...';

  try {
    let url = `/api/products?sort=${sort}`;
    if (currentCategory !== 'all') {
      url += `&category=${encodeURIComponent(currentCategory)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to load products');
    }

    cachedProducts = data.data;
    countText.textContent = `Showing ${cachedProducts.length} product${cachedProducts.length === 1 ? '' : 's'}`;

    if (cachedProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p class="text-muted">Try adjusting your search or category filter, or seed data from the free public API.</p>
          <button class="btn btn-primary" onclick="seedPublicProducts()">Seed Public Products</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = cachedProducts
      .map(
        (product) => `
      <div class="product-card">
        <div class="product-img-box">
          <span class="badge-category">${product.category}</span>
          <img class="product-img" src="${product.image}" alt="${escapeHtml(product.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'">
        </div>
        <div class="product-body">
          <h3 class="product-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
          <p class="product-desc">${escapeHtml(product.description || 'Quality product available in store.')}</p>
          
          <div class="product-meta">
            <span class="product-price">₹${Number(product.price).toFixed(2)}</span>
            <span class="product-rating">★ ${product.rating ? product.rating.rate : '4.5'} (${product.rating ? product.rating.count : '10'})</span>
          </div>

          <div class="product-actions">
            <button class="btn btn-primary btn-add" onclick="addToCart('${product._id}', '${escapeHtml(product.title)}')">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error fetching products:', err);
    countText.textContent = 'Error loading products from server.';
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p class="text-danger">Failed to connect to backend: ${err.message}</p></div>`;
  }
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-pills .pill').forEach((pill) => {
    pill.classList.toggle('active', pill.textContent.toLowerCase().includes(cat) || (cat === 'all' && pill.textContent.includes('All')));
  });
  loadProducts();
}

function handleSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadProducts();
  }, 300);
}

// ==================== SEED PUBLIC API DATA ====================
async function seedPublicProducts() {
  const btn = document.getElementById('seedBtn');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Seeding from Public API...';

  try {
    const res = await fetch('/api/products/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      loadProducts();
      if (document.getElementById('view-manage').classList.contains('active-view')) {
        loadAdminProducts();
      }
    } else {
      showToast(data.message || 'Seeding failed', 'error');
    }
  } catch (err) {
    showToast(`Network error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ==================== CART (GET, POST, PUT, DELETE) ====================
async function loadCartCount() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();
    if (data.success) {
      document.getElementById('cartCount').textContent = data.data.totalItems || 0;
    }
  } catch (err) {
    console.warn('Could not load cart count:', err);
  }
}

async function loadCart() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();

    const emptyState = document.getElementById('emptyCartState');
    const cartLayout = document.getElementById('cartLayout');
    const itemsList = document.getElementById('cartItemsList');

    if (!data.success || data.data.items.length === 0) {
      cartLayout.classList.add('hidden');
      emptyState.classList.remove('hidden');
      document.getElementById('cartCount').textContent = 0;
      return;
    }

    cartLayout.classList.remove('hidden');
    emptyState.classList.add('hidden');

    const cart = data.data;
    document.getElementById('cartCount').textContent = cart.totalItems;
    document.getElementById('cartTotalItemsText').textContent = `${cart.totalItems} item${cart.totalItems === 1 ? '' : 's'} in your cart`;
    document.getElementById('summarySubtotal').textContent = `₹${cart.subtotal.toFixed(2)}`;
    document.getElementById('summaryTax').textContent = `₹${cart.tax.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `₹${cart.total.toFixed(2)}`;

    itemsList.innerHTML = cart.items
      .map(
        (item) => `
      <div class="cart-item-card">
        <img class="cart-item-img" src="${item.product.image}" alt="${escapeHtml(item.product.title)}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.product.title)}</h4>
          <div class="cart-item-price">₹${Number(item.product.price).toFixed(2)} each</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateCartQty('${item.product._id}', ${item.quantity - 1})">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.product._id}', ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-total">₹${(item.product.price * item.quantity).toFixed(2)}</div>
          <button class="btn btn-sm btn-outline-danger" onclick="removeCartItem('${item.product._id}')" title="Remove item">✕</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error loading cart:', err);
    showToast('Failed to load cart items', 'error');
  }
}

async function addToCart(productId, title) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Added "${title || 'Item'}" to cart!`, 'success');
      loadCartCount();
    } else {
      showToast(data.message || 'Failed to add item', 'error');
    }
  } catch (err) {
    showToast('Error connecting to cart API', 'error');
  }
}

async function updateCartQty(productId, newQty) {
  if (newQty < 1) {
    return removeCartItem(productId);
  }

  try {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty }),
    });
    const data = await res.json();

    if (data.success) {
      loadCart();
    } else {
      showToast(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Network error updating quantity', 'error');
  }
}

async function removeCartItem(productId) {
  try {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      showToast('Item removed from cart', 'info');
      loadCart();
      loadCartCount();
    } else {
      showToast(data.message || 'Remove failed', 'error');
    }
  } catch (err) {
    showToast('Network error removing item', 'error');
  }
}

async function clearEntireCart() {
  if (!confirm('Are you sure you want to clear your cart?')) return;

  try {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      showToast('Cart cleared', 'info');
      loadCart();
      loadCartCount();
    }
  } catch (err) {
    showToast('Network error clearing cart', 'error');
  }
}

// ==================== 1-CLICK PAYMENT & ORDERS ====================
async function proceedToPayment() {
  const btn = document.getElementById('proceedPaymentBtn');
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Processing Payment... 💳';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Campus Customer',
        email: 'customer@swiftcart.in',
        address: 'Campus Hostel, Block B',
        phone: '+91 9876543210',
      }),
    });
    const data = await res.json();

    if (data.success) {
      showToast('🎉 Payment Successful! Order Placed.', 'success');
      loadCartCount();
      switchTab('orders');
    } else {
      showToast(data.message || 'Payment failed', 'error');
    }
  } catch (err) {
    showToast('Network error while processing payment', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

async function loadOrders() {
  const container = document.getElementById('ordersList');
  const emptyState = document.getElementById('emptyOrdersState');

  try {
    const res = await fetch('/api/orders');
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    container.innerHTML = data.data
      .map(
        (order) => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">Order #${order._id.substring(order._id.length - 8).toUpperCase()}</div>
            <div class="order-date">Placed on ${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <span class="order-status-badge status-${order.status}">${order.status}</span>
          </div>
        </div>

        <div class="order-items">
          ${order.items
            .map(
              (item) => `
            <div class="order-item-row">
              <span class="order-item-title">${escapeHtml(item.title)} <small class="text-muted">× ${item.quantity}</small></span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="order-footer">
          <div class="text-muted" style="font-size: 0.82rem;">
            Customer: <strong>${escapeHtml(order.customer.name)}</strong> (${escapeHtml(order.customer.email)})<br>
            Delivery: ${escapeHtml(order.customer.address)}
          </div>
          
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="order-status-control">
              <label for="status-${order._id}" style="margin:0;">Update Status:</label>
              <select id="status-${order._id}" onchange="updateOrderStatus('${order._id}', this.value)">
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--dark);">
              Total: ₹${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error loading orders:', err);
    showToast('Failed to load orders', 'error');
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Order status updated to "${newStatus}"`, 'success');
      loadOrders();
    } else {
      showToast(data.message || 'Status update failed', 'error');
    }
  } catch (err) {
    showToast('Network error updating order status', 'error');
  }
}

// ==================== ADMIN PRODUCT MANAGEMENT (CRUD) ====================
async function loadAdminProducts() {
  const tbody = document.getElementById('adminProductsTableBody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading products from MongoDB...</td></tr>`;

  try {
    const res = await fetch('/api/products?sort=newest');
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No products found. Click "Add New Product" to create one.</td></tr>`;
      return;
    }

    cachedProducts = data.data;

    tbody.innerHTML = cachedProducts
      .map(
        (p) => `
      <tr>
        <td>
          <img class="table-img" src="${p.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'">
        </td>
        <td>
          <strong>${escapeHtml(p.title)}</strong><br>
          <small class="text-muted">ID: ${p._id}</small>
        </td>
        <td><span class="badge-category" style="position:static;">${p.category}</span></td>
        <td><strong>₹${Number(p.price).toFixed(2)}</strong></td>
        <td>${p.stock || 20}</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm btn-secondary" onclick="openEditProductModal('${p._id}')">✏️ Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${p._id}', '${escapeHtml(p.title)}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger" style="text-align:center;">Failed to load products: ${err.message}</td></tr>`;
  }
}

function openAddProductModal() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productModal').classList.remove('hidden');
}

function openEditProductModal(productId) {
  const prod = cachedProducts.find((p) => p._id === productId);
  if (!prod) return;

  document.getElementById('editProductId').value = prod._id;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('prodTitle').value = prod.title;
  document.getElementById('prodPrice').value = prod.price;
  document.getElementById('prodStock').value = prod.stock || 20;
  document.getElementById('prodCategory').value = prod.category;
  document.getElementById('prodImage').value = prod.image;
  document.getElementById('prodDesc').value = prod.description || '';

  document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

async function handleProductFormSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('editProductId').value;
  const isEditing = Boolean(id);

  const payload = {
    title: document.getElementById('prodTitle').value.trim(),
    price: parseFloat(document.getElementById('prodPrice').value),
    stock: parseInt(document.getElementById('prodStock').value, 10),
    category: document.getElementById('prodCategory').value,
    image: document.getElementById('prodImage').value.trim() || undefined,
    description: document.getElementById('prodDesc').value.trim(),
  };

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const url = isEditing ? `/api/products/${id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showToast(isEditing ? 'Product updated successfully!' : 'Product created successfully!', 'success');
      closeProductModal();
      loadProducts();
      if (document.getElementById('view-manage').classList.contains('active-view')) {
        loadAdminProducts();
      }
    } else {
      showToast(data.message || 'Operation failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

async function deleteProduct(productId, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Product deleted successfully`, 'info');
      loadAdminProducts();
      loadProducts();
    } else {
      showToast(data.message || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast(`Error deleting product: ${err.message}`, 'error');
  }
}

// Utility: HTML escape helper to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
