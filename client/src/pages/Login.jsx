import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { setToken } from '../auth/storage';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { token } = await login(username, password);
      if (!token) throw new Error('No token returned');
      setToken(token);
      navigate('/');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '0.25rem' }}>Kings Tire</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Wheels & Auto Repair</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '0.75rem', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', boxSizing: 'border-box' }}
        />

        {error && <p style={{ color: 'red', marginBottom: '0.75rem' }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.7rem',
            background: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}