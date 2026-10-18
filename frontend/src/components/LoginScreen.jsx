import React, { useState } from 'react';
import { Shield, Lock, Mail, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin, useMock }) {
  const [roleTab, setRoleTab] = useState('ADMIN'); // 'ADMIN' or 'USER'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError(roleTab === 'ADMIN' ? 'Please enter your admin username' : 'Please enter your email');
      return;
    }
    if (roleTab === 'ADMIN' && !password.trim()) {
      setError('Password is required for Admin login');
      return;
    }

    setLoading(true);
    try {
      await onLogin({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
        roleHint: roleTab,
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role) => {
    setRoleTab(role);
    setError('');
    if (role === 'ADMIN') {
      setUsernameOrEmail('admin');
      setPassword('admin123');
    } else {
      setUsernameOrEmail('alice.johnson@example.com');
      setPassword('');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Banner */}
        <div className="login-header">
          <div className="login-icon-box">
            <Shield size={28} />
          </div>
          <h2>Secure Portal Login</h2>
          <p className="login-subtitle">PostgreSQL AES-128 Encrypted Database</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${roleTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => {
              setRoleTab('ADMIN');
              setError('');
            }}
          >
            <KeyRound size={16} />
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`role-tab ${roleTab === 'USER' ? 'active' : ''}`}
            onClick={() => {
              setRoleTab('USER');
              setError('');
            }}
          >
            <User size={16} />
            <span>Standard User</span>
          </button>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">
              {roleTab === 'ADMIN' ? 'Admin Username' : 'Registered Email Address'}
            </label>
            <div className="input-with-icon">
              {roleTab === 'ADMIN' ? (
                <User size={18} className="field-icon" />
              ) : (
                <Mail size={18} className="field-icon" />
              )}
              <input
                id="identifier"
                type={roleTab === 'ADMIN' ? 'text' : 'email'}
                placeholder={roleTab === 'ADMIN' ? 'e.g. admin' : 'e.g. alice.johnson@example.com'}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {roleTab === 'ADMIN' && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary btn-login" disabled={loading}>
            <span>{loading ? 'Authenticating...' : `Sign In as ${roleTab === 'ADMIN' ? 'Admin' : 'User'}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="quick-demo-box">
          <span className="demo-label">Quick Test Accounts:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => fillQuickDemo('ADMIN')}
            >
              Demo Admin (admin / admin123)
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => fillQuickDemo('USER')}
            >
              Demo User (Alice)
            </button>
          </div>
        </div>

        <div className="login-footer-badge">
          <Lock size={12} />
          <span>User data is decrypted transparently upon authorized access</span>
        </div>
      </div>
    </div>
  );
}
