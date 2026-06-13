import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ITEM, DELETE_ITEM, GET_ITEMS, UPDATE_ITEM } from './operations';
import { useLog } from './LogContext';

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
}

interface Props {
  isAdmin: boolean;
  onOrderItem: (item: Item) => void;
}

export function ItemsPanel({ isAdmin, onOrderItem }: Props) {
  const { push } = useLog();
  const { data, loading, error, refetch } = useQuery<{ items: Item[] }>(GET_ITEMS);

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM);
  const [updateItem] = useMutation(UPDATE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createItem({
        variables: { name, description, price: parseFloat(price), stock: parseInt(stock, 10) },
      });
      push({
        operation: 'createItem',
        type: 'mutation',
        variables: { name, price: parseFloat(price), stock: parseInt(stock, 10) },
        result: 'ok',
        detail: `item #${data.createItem.id} "${data.createItem.name}" created`,
      });
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      refetch();
    } catch (err) {
      push({
        operation: 'createItem',
        type: 'mutation',
        variables: { name },
        result: 'error',
        detail: err instanceof Error ? err.message : 'unknown error',
      });
    }
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditPrice(String(item.price));
    setEditStock(String(item.stock));
  };

  const handleUpdate = async (id: string) => {
    try {
      const { data } = await updateItem({
        variables: { id, price: parseFloat(editPrice), stock: parseInt(editStock, 10) },
      });
      push({
        operation: 'updateItem',
        type: 'mutation',
        variables: { id, price: parseFloat(editPrice), stock: parseInt(editStock, 10) },
        result: 'ok',
        detail: `item #${data.updateItem.id} → price ${data.updateItem.price}, stock ${data.updateItem.stock}`,
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      push({
        operation: 'updateItem',
        type: 'mutation',
        variables: { id },
        result: 'error',
        detail: err instanceof Error ? err.message : 'unknown error',
      });
    }
  };

  const handleDelete = async (id: string, label: string) => {
    try {
      await deleteItem({ variables: { id } });
      push({
        operation: 'deleteItem',
        type: 'mutation',
        variables: { id },
        result: 'ok',
        detail: `item #${id} "${label}" deleted`,
      });
      refetch();
    } catch (err) {
      push({
        operation: 'deleteItem',
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
        <h2 className="panel__title">Catalog</h2>
        <span className="panel__meta">items-service</span>
      </div>

      {loading && <div className="empty">Loading items…</div>}
      {error && <div className="error-banner">{error.message}</div>}

      {data && data.items.length === 0 && <div className="empty">No items yet.</div>}

      <div>
        {data?.items.map((item) => (
          <div className="item-row" key={item.id}>
            <div>
              <div className="item-row__name">{item.name}</div>
              {item.description && <div className="item-row__desc">{item.description}</div>}
              {editingId === item.id && (
                <div className="field-row" style={{ marginTop: 8 }}>
                  <div className="field">
                    <label>Price</label>
                    <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Stock</label>
                    <input value={editStock} onChange={(e) => setEditStock(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <div className="item-row__price">${item.price.toFixed(2)}</div>
            <div className="item-row__stock">stock: {item.stock}</div>
            <div className="item-actions">
              {editingId === item.id ? (
                <>
                  <button className="btn btn--small" onClick={() => handleUpdate(item.id)}>
                    Save
                  </button>
                  <button className="btn btn--ghost btn--small" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn--ghost btn--small" onClick={() => onOrderItem(item)}>
                    Order
                  </button>
                  {isAdmin && (
                    <>
                      <button className="btn btn--ghost btn--small" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn--danger btn--small" onClick={() => handleDelete(item.id, item.name)}>
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdmin ? (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6, borderTop: '1px solid var(--panel-border)' }}>
          <div className="panel__meta" style={{ paddingTop: 4 }}>Add item (admin)</div>
          <div className="field">
            <label>Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Price</label>
              <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="field">
              <label>Stock</label>
              <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create item'}
          </button>
        </form>
      ) : (
        <p className="panel__meta">Sign in as ADMIN to create, edit, or delete items.</p>
      )}
    </div>
  );
}
