import React, { useState, useEffect } from 'react';
import { userService } from './services/userService';
import StatsCards from './components/StatsCards';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { UserPlus, Shield, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(true); // Default to mock so it works out of the box
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers(useMock);
      setUsers(data || []);
    } catch (err) {
      showToast('Error loading users: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [useMock]);

  const handleToggleMock = () => {
    const nextMock = !useMock;
    setUseMock(nextMock);
    showToast(
      nextMock
        ? 'Switched to Local Demo Mode'
        : 'Switched to Live Backend Mode (/api/users)',
      'info'
    );
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData, useMock);
        showToast(`User "${formData.name}" updated successfully!`);
      } else {
        await userService.createUser(formData, useMock);
        showToast(`User "${formData.name}" created and encrypted in DB!`);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      showToast('Failed to save user: ' + err.message, 'error');
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await userService.deleteUser(id, useMock);
      showToast('User removed from database');
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      showToast('Failed to delete user: ' + err.message, 'error');
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-group">
            <div className="brand-icon">
              <Shield size={24} />
            </div>
            <div>
              <div className="brand-title">User Management System</div>
              <div className="brand-subtitle">
                Hibernate JPA Entity Manager with AES-128 Column Encryption
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="btn-refresh"
              onClick={loadUsers}
              title="Refresh list"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button className="btn-primary" onClick={handleOpenAddModal}>
              <UserPlus size={18} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {/* Key Stat Cards */}
          <StatsCards
            users={users}
            useMock={useMock}
            onToggleMock={handleToggleMock}
          />

          {/* User Table & Toolbar */}
          <UserTable
            users={users}
            onEdit={handleOpenEditModal}
            onDelete={(user) => setDeletingUser(user)}
            onOpenAddModal={handleOpenAddModal}
          />
        </div>
      </main>

      {/* Add / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleModalSubmit}
        initialUser={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        user={deletingUser}
      />
    </div>
  );
}
