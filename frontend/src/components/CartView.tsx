import React, { useState } from 'react';
import type { CartData, Customer } from '../types';

interface CartViewProps {
  cart: CartData | null;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onCheckout: (customer: Customer) => Promise<void>;
  onContinueShopping: () => void;
  isCheckingOut: boolean;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onContinueShopping,
  isCheckingOut,
}) => {
  const [customer, setCustomer] = useState<Customer>({
    name: 'Aadidev Panchani',
    email: 'aadidev@swiftcart.in',
    phone: '+91 9876543210',
    address: 'Flat 402, Skyline Residency, Tech City',
  });
  const [error, setError] = useState('');

  if (!cart || cart.items.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛒</div>
        <h3 style={{ marginBottom: '8px' }}>Your Cart is Empty</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Explore our catalog and find something exceptional to add to your cart!
        </p>
        <button className="btn btn-primary" onClick={onContinueShopping}>
          <span>Explore Products</span>
        </button>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim()) {
      setError('Please fill in customer name, email, and shipping address.');
      return;
    }
    setError('');
    await onCheckout(customer);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(300px, 1.2fr)', gap: '30px', alignItems: 'start' }}>
      {/* Cart Items List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛒 Shopping Cart</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              ({cart.totalItems} item{cart.totalItems === 1 ? '' : 's'})
            </span>
          </h3>
          <button className="btn btn-danger btn-sm" onClick={onClearCart}>
            Clear Cart
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}
                    title={product.title}
                  >
                    {product.title}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    ${Number(product.price).toFixed(2)} each
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => onUpdateQuantity(product._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity}
                  </span>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    onClick={() => onUpdateQuantity(product._id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div style={{ width: '80px', textAlign: 'right', fontWeight: 800, fontFamily: 'Outfit' }}>
                  ${(product.price * item.quantity).toFixed(2)}
                </div>

                <button
                  className="btn btn-secondary btn-icon"
                  style={{ color: '#f87171', width: '32px', height: '32px' }}
                  title="Remove item"
                  onClick={() => onRemoveItem(product._id)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Summary & Customer Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          Order Summary & Checkout
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Estimated Tax (5%)</span>
            <span>${cart.tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Shipping</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>FREE</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              paddingTop: '12px',
              marginTop: '4px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span>Total</span>
            <span style={{ color: '#38bdf8' }}>${cart.total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '8px' }}>
            Shipping & Customer Details
          </h4>

          {error && (
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.825rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              className="form-input"
              required
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Email *
              </label>
              <input
                type="email"
                className="form-input"
                required
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Phone
              </label>
              <input
                type="tel"
                className="form-input"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
              Delivery Address *
            </label>
            <textarea
              className="form-textarea"
              required
              style={{ minHeight: '60px' }}
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={isCheckingOut}
          >
            <span>{isCheckingOut ? 'Processing Checkout...' : '💳 Complete Order & Checkout'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
