import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const response = await api.post('/auth/register', formData);

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/profile');
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors || [err.response?.data?.error] || ["Registration failed"];
      setErrors(backendErrors);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Join PlotPoint</h2>
        
        {errors.length > 0 && (
          <div className="error-box" style={{ color: 'var(--terracotta)', marginBottom: '1rem' }}>
            {errors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" required onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="Min 8 chars, 1 number, 1 special" 
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn-cta">Create Account</button>
        </form>
        <p className="auth-footer">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default Register;