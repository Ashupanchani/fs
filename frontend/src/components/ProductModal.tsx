import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { Modal } from './Modal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState("men's clothing");
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState<number | ''>(50);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPrice(initialData.price ?? '');
      setCategory(initialData.category || "men's clothing");
      setDescription(initialData.description || '');
      setImage(initialData.image || '');
      setStock(initialData.stock ?? 50);
    } else {
      setTitle('');
      setPrice('');
      setCategory("men's clothing");
      setDescription('');
      setImage('');
      setStock(50);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price === '' || Number(price) <= 0) {
      setError('Please provide a valid product title and price greater than 0.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        price: Number(price),
        category,
        description: description.trim() || 'High quality item carefully sourced and inspected.',
        image: image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        stock: stock === '' ? 50 : Number(stock),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '✏️ Edit Product' : '➕ Add New Product'}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
            Product Title *
          </label>
          <input
            type="text"
            className="form-input"
            required
            placeholder="e.g. Vintage Leather Messenger Bag"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Price (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              required
              placeholder="49.99"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Category *
            </label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="men's clothing">Men's Clothing</option>
              <option value="women's clothing">Women's Clothing</option>
              <option value="jewelery">Jewelry</option>
              <option value="electronics">Electronics</option>
              <option value="footwear">Footwear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              Image URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
            Description
          </label>
          <textarea
            className="form-textarea"
            placeholder="Detailed description of features, materials, and warranty..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
