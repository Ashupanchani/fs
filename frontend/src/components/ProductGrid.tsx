import React from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onSeed: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onAddToCart,
  onEdit,
  onDelete,
  onSeed,
}) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="product-card" style={{ opacity: 0.5 }}>
            <div className="product-image-container" style={{ background: '#1e293b' }}>
              <span style={{ color: 'var(--text-dim)' }}>Loading...</span>
            </div>
            <div className="product-content">
              <div style={{ height: '20px', background: '#334155', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ height: '14px', width: '60%', background: '#334155', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
        <h3 style={{ marginBottom: '8px' }}>No Products Found</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
          Your database currently has no products matching the search or filters. You can seed initial data with one click!
        </p>
        <button className="btn btn-primary" onClick={onSeed}>
          <span>🔄 Seed Products from Public Free API</span>
        </button>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
