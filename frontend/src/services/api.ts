import type { Product, CartData, Order, OrderStatus, Customer, ApiResponse } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data;
}

// ================= PRODUCT APIs =================
export async function getProducts(category = 'all', search = '', sort = 'newest'): Promise<Product[]> {
  let url = `${API_BASE}/products?sort=${encodeURIComponent(sort)}`;
  if (category && category !== 'all') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  const res = await fetch(url);
  return handleResponse<Product[]>(res);
}

export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<Product>(res);
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse<Product>(res);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<null>(res);
}

export async function seedProducts(): Promise<{ count: number; message: string }> {
  const res = await fetch(`${API_BASE}/products/seed`, {
    method: 'POST',
  });
  return handleResponse<{ count: number; message: string }>(res);
}

// ================= CART APIs =================
export async function getCart(): Promise<CartData> {
  const res = await fetch(`${API_BASE}/cart`);
  return handleResponse<CartData>(res);
}

export async function addToCart(productId: string, quantity = 1): Promise<CartData> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse<CartData>(res);
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<CartData> {
  const res = await fetch(`${API_BASE}/cart/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  return handleResponse<CartData>(res);
}

export async function removeFromCart(productId: string): Promise<CartData> {
  const res = await fetch(`${API_BASE}/cart/${productId}`, {
    method: 'DELETE',
  });
  return handleResponse<CartData>(res);
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
  });
  await handleResponse<null>(res);
}

// ================= ORDER APIs =================
export async function createOrder(customer: Customer): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  return handleResponse<Order>(res);
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`);
  return handleResponse<Order[]>(res);
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`);
  return handleResponse<Order>(res);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Order>(res);
}
