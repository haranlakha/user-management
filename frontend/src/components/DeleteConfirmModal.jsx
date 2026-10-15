import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, user }) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge danger">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3>Confirm Deletion</h3>
              <p className="modal-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="delete-body">
          <p>
            Are you sure you want to permanently delete user{' '}
            <strong>{user.name}</strong> (ID: #{user.id})?
          </p>
          <div className="user-preview-tag">
            <span>{user.email}</span> • <span>{user.age} yrs</span>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onConfirm(user.id)}
          >
            <Trash2 size={16} /> Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
