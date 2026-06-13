import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN, REGISTER } from './operations';
import { useLog } from './LogContext';

interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

interface Props {
  user: AuthUser | null;
  onAuth: (token: string, user: AuthUser) => void;
  onLogout: () => void;
}

export function AuthPanel({ user, onAuth, onLogout }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { push } = useLog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');

  const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN);
  const [register, { loading: registerLoading, error: registerError }] = useMutation(REGISTER);

  const loading = loginLoading || registerLoading;
  const error = mode === 'login' ? loginError : registerError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const { data } = await login({ variables: { email, password } });
        push({
          operation: 'login',
          type: 'mutation',
          variables: { email, password: '••••••' },
          result: 'ok',
          detail: `user #${data.login.user.id} · role ${data.login.user.role}`,
        });
        localStorage.setItem('token', data.login.token);
        onAuth(data.login.token, data.login.user);
      } else {
        const { data } = await register({
          variables: {
            firstName, lastName, email, password, phone, address,
            city, state: stateField, country, zip,
          },
        });
        push({
          operation: 'register',
          type: 'mutation',
          variables: { email, firstName, lastName },
          result: 'ok',
          detail: `user #${data.register.user.id} created · role ${data.register.user.role}`,
        });
        localStorage.setItem('token', data.register.token);
        onAuth(data.register.token, data.register.user);
      }
    } catch (err) {
      push({
        operation: mode,
        type: 'mutation',
        variables: { email },
        result: 'error',
        detail: err instanceof Error ? err.message : 'unknown error',
      });
    }
  };

  if (user) {
    return (
      <div className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Session</h2>
          <span className="panel__meta">users-service</span>
        </div>
        <div className="field">
          <label>Signed in as</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
            {user.firstName} {user.lastName} &lt;{user.email}&gt;
          </div>
        </div>
        <div className="field">
          <label>Role</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>
            {user.role}
          </div>
        </div>
        <div className="field">
          <label>User ID</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>#{user.id}</div>
        </div>
        <button className="btn btn--ghost" onClick={onLogout}>
          Log out
        </button>
        {user.role !== 'ADMIN' && (
          <p className="panel__meta">
            Item create/update/delete requires an ADMIN role. Promote this user
            in the database to test those mutations.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <h2 className="panel__title">Access</h2>
        <span className="panel__meta">users-service</span>
      </div>
      <div className="tabs">
        <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
          Login
        </button>
        <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {mode === 'register' && (
          <>
            <div className="field-row">
              <div className="field">
                <label>First name</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="field">
                <label>Last name</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+70000000000" />
            </div>
            <div className="field">
              <label>Address</label>
              <input required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field">
                <label>State</label>
                <input required value={stateField} onChange={(e) => setStateField(e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Country</label>
                <input required value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="field">
                <label>ZIP</label>
                <input required value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            </div>
          </>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        {error && <div className="error-banner">{error.message}</div>}
      </form>
    </div>
  );
}
