import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Product, CartData, Order, OrderStatus, Customer } from './types';
import * as api from './services/api';

import { Navbar } from './components/Navbar';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartView } from './components/CartView';
import { OrderHistory } from './components/OrderHistory';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

export function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'cart' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProducts(selectedCategory, search, sort);
      setProducts(data);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, sort, addToast]);

  // Load cart from API
  const loadCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err: unknown) {
      console.error('Failed to load cart', err);
    }
  }, []);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: unknown) {
      console.error('Failed to load orders', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCart();
    loadOrders();
  }, [loadCart, loadOrders]);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Add to cart handler
  const handleAddToCart = async (product: Product, quantity: number) => {
    try {
      const updatedCart = await api.addToCart(product._id, quantity);
      setCart(updatedCart);
      addToast(`Added ${quantity}x "${product.title}" to cart!`);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Could not add to cart', 'error');
    }
  };

  // Update cart item quantity
  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to update quantity', 'error');
    }
  };

  // Remove item from cart
  const handleRemoveFromCart = async (productId: string) => {
    try {
      const updatedCart = await api.removeFromCart(productId);
      setCart(updatedCart);
      addToast('Item removed from cart', 'info');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to remove item', 'error');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    try {
      await api.clearCart();
      setCart({ items: [], totalItems: 0, subtotal: 0, tax: 0, total: 0 });
      addToast('Cart has been cleared', 'info');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to clear cart', 'error');
    }
  };

  // Checkout order
  const handleCheckout = async (customer: Customer) => {
    try {
      setIsCheckingOut(true);
      const newOrder = await api.createOrder(customer);
      setCart({ items: [], totalItems: 0, subtotal: 0, tax: 0, total: 0 });
      setOrders((prev) => [newOrder, ...prev]);
      setActiveTab('orders');
      addToast(`Order #${newOrder._id.slice(-6).toUpperCase()} placed successfully! 🎉`);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Checkout failed', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Seed products
  const handleSeedProducts = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seedProducts();
      addToast(res.message || 'Seeded products successfully from public API!');
      await loadProducts();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Seeding failed', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Save (create or update) product
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const updated = await api.updateProduct(editingProduct._id, productData);
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      addToast('Product updated successfully!');
    } else {
      const created = await api.createProduct(productData);
      setProducts((prev) => [created, ...prev]);
      addToast('Product created successfully!');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      await loadCart();
      addToast('Product deleted', 'info');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    }
  };

  // Update order fulfillment status
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      addToast(`Order marked as ${status}`);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  return (
    <div>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cart?.totalItems ?? 0}
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onSeed={handleSeedProducts}
        isSeeding={isSeeding}
      />

      <main className="app-container">
        {activeTab === 'products' && (
          <>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              totalCount={products.length}
            />

            <ProductGrid
              products={products}
              loading={loading}
              onAddToCart={handleAddToCart}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setIsProductModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
              onSeed={handleSeedProducts}
            />
          </>
        )}

        {activeTab === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => setActiveTab('products')}
            isCheckingOut={isCheckingOut}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistory
            orders={orders}
            onStatusChange={handleUpdateOrderStatus}
            onRefresh={loadOrders}
            onContinueShopping={() => setActiveTab('products')}
          />
        )}
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
