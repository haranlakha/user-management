import React, { useState } from 'react';
import { Shield, Lock, Mail, User, KeyRound, AlertCircle, ArrowRight, UserPlus, Check, X } from 'lucide-react';

export default function LoginScreen({ onLogin, onRegister, useMock }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [roleTab, setRoleTab] = useState('USER'); // 'USER' or 'ADMIN'

  // Form Fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername('');
    setName('');
    setEmail('');
    setAge('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleToggleMode = (register) => {
    setIsRegisterMode(register);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Registration Validation ---
    if (isRegisterMode) {
      if (!password) {
        setError('Password is required');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your confirmation password.');
        return;
      }

      if (roleTab === 'ADMIN') {
        if (!username.trim()) {
          setError('Admin username is required');
          return;
        }
      } else {
        if (!name.trim() || !email.trim() || !age) {
          setError('Name, Email, and Age are all required');
          return;
        }
      }

      setLoading(true);
      try {
        await onRegister({
          role: roleTab,
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          age: Number(age),
          password: password.trim(),
          confirmPassword: confirmPassword.trim(),
        });
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Sign In Validation ---
    const identifier = roleTab === 'ADMIN' ? username.trim() : email.trim();
    if (!identifier) {
      setError(roleTab === 'ADMIN' ? 'Please enter your admin username' : 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await onLogin({
        usernameOrEmail: identifier,
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
    setIsRegisterMode(false);
    setRoleTab(role);
    setError('');
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setEmail('alice.johnson@example.com');
      setPassword('admin123');
    }
  };

  // Password match indicator
  const showMatchBadge = isRegisterMode && password.length > 0 && confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-box">
            {isRegisterMode ? <UserPlus size={28} /> : <Shield size={28} />}
          </div>
          <h2>{isRegisterMode ? 'Create New Account' : 'Library Portal Login'}</h2>
          <p className="login-subtitle">
            {isRegisterMode
              ? 'Create a new user'
              : 'Login to Library Management System'}
          </p>
        </div>

        {/* Mode Toggle (Sign In vs Create Account) */}
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`auth-mode-btn ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => handleToggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${isRegisterMode ? 'active' : ''}`}
            onClick={() => handleToggleMode(true)}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${roleTab === 'USER' ? 'active' : ''}`}
            onClick={() => { setRoleTab('USER'); setError(''); }}
          >
            <User size={16} />
            <span>Standard User</span>
          </button>
          <button
            type="button"
            className={`role-tab ${roleTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => { setRoleTab('ADMIN'); setError(''); }}
          >
            <KeyRound size={16} />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Admin Fields */}
          {roleTab === 'ADMIN' && (
            <div className="form-group">
              <label htmlFor="username">Admin Username</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          )}

          {/* User Fields (Only shown during Register mode) */}
          {roleTab === 'USER' && isRegisterMode && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="130"
                  placeholder="e.g. 29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* User Sign In Email Field */}
          {roleTab === 'USER' && !isRegisterMode && (
            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="e.g. alice.johnson@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                id="password"
                type="password"
                placeholder={isRegisterMode ? 'Choose a secure password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Confirmation Box (Shown during Registration) */}
          {isRegisterMode && (
            <div className="form-group">
              <div className="confirm-label-row">
                <label htmlFor="confirmPassword">Confirm Password</label>
                {showMatchBadge && (
                  <span className={`match-pill ${passwordsMatch ? 'match' : 'mismatch'}`}>
                    {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={showMatchBadge && !passwordsMatch ? 'input-error' : ''}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary btn-login" disabled={loading}>
            <span>
              {loading
                ? 'Processing...'
                : isRegisterMode
                ? `Create ${roleTab === 'ADMIN' ? 'Admin' : 'User'} Account`
                : `Sign In as ${roleTab === 'ADMIN' ? 'Admin' : 'User'}`}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Accounts (Available in Sign In mode) */}
        {!isRegisterMode && (
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
        )}

        {/* Footer switch prompt */}
        <div className="auth-footer-prompt">
          {isRegisterMode ? (
            <span>
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => handleToggleMode(false)}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button type="button" className="link-btn" onClick={() => handleToggleMode(true)}>
                Create One Now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
