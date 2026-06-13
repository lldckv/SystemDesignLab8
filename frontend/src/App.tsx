import { useState } from 'react';
import { AuthPanel } from './AuthPanel';
import { ItemsPanel } from './ItemsPanel';
import { OrdersPanel, type PendingOrderItem } from './OrdersPanel';
import { RequestLog } from './RequestLog';
import './styles.css';

interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingItem, setPendingItem] = useState<PendingOrderItem | null>(null);

  const handleAuth = (_token: string, u: AuthUser) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPendingItem(null);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">
            lab8<span>::</span>marketplace
          </h1>
          <p className="app__subtitle">
            React + Apollo Client → Apollo Gateway (localhost:4000) → users / items / orders subgraphs
          </p>
        </div>
        <div className="session">
          <span className={`session__dot ${user ? 'online' : ''}`} />
          <span className="session__label">gateway</span>
          <span className="session__value">localhost:4000</span>
        </div>
      </header>

      <div className="grid">
        <AuthPanel user={user} onAuth={handleAuth} onLogout={handleLogout} />
        <ItemsPanel
          isAdmin={user?.role === 'ADMIN'}
          onOrderItem={(item) => setPendingItem({ id: item.id, name: item.name })}
        />
        <OrdersPanel
          isAuthenticated={!!user}
          pendingItem={pendingItem}
          onClearPending={() => setPendingItem(null)}
        />
      </div>

      <RequestLog />
    </div>
  );
}
