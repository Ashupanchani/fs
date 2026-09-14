import React from 'react';
import type { Order, OrderStatus } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  onRefresh: () => void;
  onContinueShopping: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onStatusChange,
  onRefresh,
  onContinueShopping,
}) => {
  if (orders.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
        <h3 style={{ marginBottom: '8px' }}>No Orders Placed Yet</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          When you complete a checkout, your order details and fulfillment timeline will appear here.
        </p>
        <button className="btn btn-primary" onClick={onContinueShopping}>
          <span>Start Shopping</span>
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-pending">🟡 Pending</span>;
      case 'Processing':
        return <span className="badge badge-processing">🔵 Processing</span>;
      case 'Shipped':
        return <span className="badge badge-shipped">🟣 Shipped</span>;
      case 'Delivered':
        return <span className="badge badge-delivered">🟢 Delivered</span>;
      case 'Cancelled':
        return <span className="badge badge-cancelled">🔴 Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Order History</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track and manage your recent orders, line items, and fulfillment statuses
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
          <span>🔄 Refresh</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => (
          <div key={order._id} className="glass-panel" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Update Status:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value as OrderStatus)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.title}
                    style={{ width: '44px', height: '44px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#38bdf8' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Customer Info */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                color: 'var(--text-dim)',
              }}
            >
              <div>
                <span>Deliver to: <strong>{order.customer.name}</strong> ({order.customer.email}) • {order.customer.address}</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--text-main)' }}>
                Total: <span style={{ color: '#38bdf8' }}>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
