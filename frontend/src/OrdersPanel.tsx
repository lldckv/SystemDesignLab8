import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CANCEL_ORDER, CREATE_ORDER, GET_ORDERS } from './operations';
import { useLog } from './LogContext';

interface OrderLine {
  itemId: string;
  quantity: number;
  item: { name: string; price: number };
}

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  orderDate: string;
  items: OrderLine[];
}

export interface PendingOrderItem {
  id: string;
  name: string;
}

interface Props {
  isAuthenticated: boolean;
  pendingItem: PendingOrderItem | null;
  onClearPending: () => void;
}

export function OrdersPanel({ isAuthenticated, pendingItem, onClearPending }: Props) {
  const { push } = useLog();
  const { data, loading, error, refetch } = useQuery<{ orders: Order[] }>(GET_ORDERS, {
    skip: !isAuthenticated,
  });

  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const [quantity, setQuantity] = useState('1');

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingItem) return;
    const qty = parseInt(quantity, 10);
    try {
      const { data } = await createOrder({
        variables: { items: [{ itemId: pendingItem.id, quantity: qty }] },
      });
      push({
        operation: 'createOrder',
        type: 'mutation',
        variables: { items: [{ itemId: pendingItem.id, quantity: qty }] },
        result: 'ok',
        detail: `order #${data.createOrder.id} · total $${data.createOrder.totalPrice.toFixed(2)} · ${data.createOrder.status}`,
      });
      onClearPending();
      setQuantity('1');
      refetch();
    } catch (err) {
      push({
        operation: 'createOrder',
        type: 'mutation',
        variables: { itemId: pendingItem.id, quantity: qty },
        result: 'error',
        detail: err instanceof Error ? err.message : 'unknown error',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelOrder({ variables: { id } });
      push({
        operation: 'cancelOrder',
        type: 'mutation',
        variables: { id },
        result: 'ok',
        detail: `order #${id} cancelled`,
      });
      refetch();
    } catch (err) {
      push({
        operation: 'cancelOrder',
        type: 'mutation',
        variables: { id },
        result: 'error',
        detail: err instanceof Error ? err.message : 'unknown error',
      });
    }
  };

  return (
    <div className="panel">
      <div className="panel__head">
        <h2 className="panel__title">Orders</h2>
        <span className="panel__meta">orders-service</span>
      </div>

      {!isAuthenticated && <div className="empty">Sign in to view and place orders.</div>}

      {isAuthenticated && pendingItem && (
        <form onSubmit={handleCreateOrder} className="notice" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            Ordering: <strong>{pendingItem.name}</strong> (item #{pendingItem.id})
          </div>
          <div className="field-row">
            <div className="field">
              <label>Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button className="btn" type="submit" disabled={creating}>
                {creating ? 'Placing…' : 'Place order'}
              </button>
              <button className="btn btn--ghost" type="button" onClick={onClearPending}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {isAuthenticated && loading && <div className="empty">Loading orders…</div>}
      {isAuthenticated && error && <div className="error-banner">{error.message}</div>}
      {isAuthenticated && data && data.orders.length === 0 && (
        <div className="empty">No orders yet — pick an item from the catalog and click "Order".</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data?.orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card__head">
              <span>#{order.id}</span>
              <span className={`order-card__status ${order.status}`}>{order.status}</span>
            </div>
            {order.items.map((line, idx) => (
              <div className="order-card__line" key={idx}>
                <span>{line.item.name} × {line.quantity}</span>
                <span>${(line.item.price * line.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-card__total">total: ${order.totalPrice.toFixed(2)}</div>
            {order.status !== 'CANCELLED' && order.status !== 'cancelled' && order.status !== 'CANCELED' && order.status !== 'canceled' && (
              <button className="btn btn--ghost btn--small" onClick={() => handleCancel(order.id)}>
                Cancel order
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
