import React from 'react';

interface NavbarProps {
  activeTab: 'products' | 'cart' | 'orders';
  onTabChange: (tab: 'products' | 'cart' | 'orders') => void;
  cartCount: number;
  onOpenAddProduct: () => void;
  onSeed: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  onOpenAddProduct,
  onSeed,
  isSeeding,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" onClick={() => onTabChange('products')}>
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-title">SwiftCart</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              React + TypeScript E-Commerce
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => onTabChange('products')}
          >
            <span>🛍️</span>
            <span>Products</span>
          </button>

          <button
            className={`nav-tab cart-pill ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => onTabChange('cart')}
          >
            <span>🛒</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
          </button>

          <button
            className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => onTabChange('orders')}
          >
            <span>📦</span>
            <span>Orders</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onOpenAddProduct}>
            <span>➕</span>
            <span>New Product</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onSeed}
            disabled={isSeeding}
            title="Seed sample products from public free API"
          >
            <span>{isSeeding ? '⏳' : '🔄'}</span>
            <span>{isSeeding ? 'Seeding...' : 'Seed API'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
