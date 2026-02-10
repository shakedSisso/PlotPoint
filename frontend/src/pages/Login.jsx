import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const user = response.data.user; 
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        navigate('/profile');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.errors?.[0] || "Connection failed";
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{textAlign: 'center'}}>Welcome Back</h2>
        {error && <p style={{ color: 'var(--terracotta)', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-cta">Login</button>
        </form>
        <p className="auth-footer">New here? <a href="/register">Create account</a></p>
      </div>
    </div>
  );
};

export default Login;