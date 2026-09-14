import React, { useState } from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  isAdding?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onEdit,
  onDelete,
  isAdding = false,
}) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <span className="product-category-tag">{product.category}</span>
        <img
          src={product.image || 'https://via.placeholder.com/300?text=No+Image'}
          alt={product.title}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
          }}
        />
      </div>

      <div className="product-content">
        <h4 className="product-title" title={product.title}>
          {product.title}
        </h4>

        <div className="product-rating">
          <span>⭐ {product.rating?.rate ?? '4.5'}</span>
          <span className="rating-count">({product.rating?.count ?? 28} reviews)</span>
          {product.isCustom && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '0.7rem',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Custom
            </span>
          )}
        </div>

        <div className="product-price-row">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Price</span>
            <span className="product-price">${Number(product.price).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              {qty}
            </span>
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={() => setQty((prev) => prev + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="product-card-actions">
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={isAdding}
            onClick={() => onAddToCart(product, qty)}
          >
            <span>🛒</span>
            <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          <button
            className="btn btn-secondary btn-icon"
            title="Edit Product"
            onClick={() => onEdit(product)}
          >
            ✏️
          </button>

          <button
            className="btn btn-secondary btn-icon"
            style={{ color: '#f87171' }}
            title="Delete Product"
            onClick={() => onDelete(product._id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
