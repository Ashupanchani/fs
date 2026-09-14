export interface Product {
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
  stock?: number;
  isCustom?: boolean;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  product: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  customer: Customer;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
