import axios, { AxiosError } from 'axios';
import type { Product, CartData, Order, OrderStatus, Customer, ApiResponse } from '../types';

// Create configured Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to unwrap data and format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; message?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// Helper function to extract data payload from ApiResponse
function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request indicated failure');
  }
  return response.data.data;
}

// ================= PRODUCT APIs =================
export async function getProducts(category = 'all', search = '', sort = 'newest'): Promise<Product[]> {
  const params: Record<string, string> = { sort };
  if (category && category !== 'all') {
    params.category = category;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
  return extractData(response);
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return extractData(response);
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const response = await apiClient.post<ApiResponse<Product>>('/products', productData);
  return extractData(response);
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, productData);
  return extractData(response);
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  extractData(response);
}

export async function seedProducts(): Promise<{ count: number; message: string }> {
  const response = await apiClient.post<ApiResponse<{ count: number; message: string }>>('/products/seed');
  return extractData(response);
}

// ================= CART APIs =================
export async function getCart(): Promise<CartData> {
  const response = await apiClient.get<ApiResponse<CartData>>('/cart');
  return extractData(response);
}

export async function addToCart(productId: string, quantity = 1): Promise<CartData> {
  const response = await apiClient.post<ApiResponse<CartData>>('/cart', { productId, quantity });
  return extractData(response);
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<CartData> {
  const response = await apiClient.put<ApiResponse<CartData>>(`/cart/${productId}`, { quantity });
  return extractData(response);
}

export async function removeFromCart(productId: string): Promise<CartData> {
  const response = await apiClient.delete<ApiResponse<CartData>>(`/cart/${productId}`);
  return extractData(response);
}

export async function clearCart(): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>('/cart');
  extractData(response);
}

// ================= ORDER APIs =================
export async function createOrder(customer: Customer): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>('/orders', customer);
  return extractData(response);
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
  return extractData(response);
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return extractData(response);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
  return extractData(response);
}

export default apiClient;
