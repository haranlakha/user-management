import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, ShieldCheck } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSubmit, initialUser = null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        email: initialUser.email || '',
        age: initialUser.age?.toString() || '',
      });
    } else {
      setFormData({ name: '', email: '', age: '' });
    }
    setErrors({});
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || Number(formData.age) < 1 || Number(formData.age) > 130) {
      newErrors.age = 'Age must be between 1 and 130';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      age: Number(formData.age),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              {initialUser ? <Save size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h3>{initialUser ? 'Edit User' : 'Create New User'}</h3>
              <p className="modal-subtitle">
                {initialUser
                  ? `Updating record for ID #${initialUser.id}`
                  : 'Add a new encrypted record to the PostgreSQL database'}
              </p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="encryption-banner">
          <ShieldCheck size={16} />
          <span>Fields will be encrypted with AES-128 before persisting to DB.</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'input-error' : ''}
              autoFocus
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              type="number"
              min="1"
              max="130"
              placeholder="e.g. 29"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className={errors.age ? 'input-error' : ''}
            />
            {errors.age && <span className="field-error">{errors.age}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
