import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './Pages.css';

const AdminLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      onLogin(response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    // Development mode: quick admin access
    onLogin('dev-token-admin');
    navigate('/admin/dashboard');
  };

  return (
    <div className="container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Admin Dashboard</h2>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@minerprices.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Development Mode</p>
          <button 
            type="button"
            onClick={handleQuickLogin}
            style={{ backgroundColor: '#ff9800', marginTop: '10px' }}
          >
            🚀 Quick Admin Access (Dev)
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
