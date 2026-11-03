import React, {useState, useEffect} from 'react';
import {userService} from './services/userService';
import StatsCards from './components/StatsCards';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LoginScreen from './components/LoginScreen';
import UserPortal from './components/UserPortal';
import {UserPlus, Shield, RefreshCw, CheckCircle, AlertCircle, LogOut, ShieldAlert} from 'lucide-react';
import './App.css';

export default function App() {

    const [auth, setAuth] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        localStorage.removeItem('auth_session');
        userService.init().then(setAuth).catch(() => setAuth(null)).finally(() => setCheckingSession(false));
    }, []);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({message, type});
        setTimeout(() => setToast(null), 3500);
    };

    const handleLogin = async ({usernameOrEmail, password, roleHint}) => {
        const result = await userService.login(usernameOrEmail, password, roleHint);
        setAuth(result);
        showToast(`Welcome! Logged in as ${result.role === 'ADMIN' ? 'Administrator' : result.user.name}`);
    };

    const handleRegister = async (registerData) => {
        const result = await userService.register(registerData);
        setAuth(result);
        showToast(
            `Account created! Welcome, ${result.role === 'ADMIN' ? 'Administrator' : result.user.name}`
        );
    };

    const handleLogout = async () => {
        await userService.logout();
        setAuth(null);
        showToast('You have been logged out.');
    };

    const loadUsers = async () => {
        if (!auth || auth.role !== 'ADMIN') return;
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            showToast('Error loading users: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth && auth.role === 'ADMIN') {
            loadUsers().then(() => {
            });
        }
    }, [auth]);

    const handleModalSubmit = async (formData) => {
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
                showToast(`User "${formData.name}" updated successfully!`);
            } else {
                await userService.createUser(formData);
                showToast(`User "${formData.name}" created and encrypted in DB!`);
            }
            setIsModalOpen(false);
            setEditingUser(null);
            await loadUsers();
        } catch (err) {
            showToast('Failed to save user: ' + err.message, 'error');
        }
    };

    const handleConfirmDelete = async (id) => {
        try {
            await userService.deleteUser(id);
            showToast('Deleted user');
            setDeletingUser(null);
            await loadUsers();
        } catch (err) {
            showToast('Failed to delete user: ' + err.message, 'error');
        }
    };

    const handleUpdateSelf = async (updatedUser) => {
        await userService.updateUser(updatedUser.id, updatedUser);
        const newAuth = {...auth, user: updatedUser};
        setAuth(newAuth);
    };

    if (checkingSession) {
        return null;
    }

    // 1. Not Logged In -> Show Login Screen
    if (!auth) {
        return <LoginScreen onLogin={handleLogin} onRegister={handleRegister}/>;
    }

    // 2. Standard User -> Show New User Portal Page
    if (auth.role === 'USER') {
        return <UserPortal user={auth.user} onLogout={handleLogout} onUpdateSelf={handleUpdateSelf}/>;
    }

    // 3. Admin User -> Show Existing User Management Page
    return (
        <div className="app-layout">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Header with Admin Badge & Logout */}
            <header className="app-header">
                <div className="header-container">
                    <div className="brand-group">
                        <div className="brand-icon">
                            <Shield size={24}/>
                        </div>
                        <div>
                            <div className="brand-title">SecureUser DB (Admin)</div>
                            <div className="brand-subtitle">Hibernate JPA Entity Manager with AES-256-GCM Column
                                Encryption
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
            <span className="admin-status-pill">
              <ShieldAlert size={14}/> Logged in as: {auth.user?.username}
            </span>

                        <button className="btn-refresh" onClick={loadUsers} title="Refresh list" disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'spin' : ''}/>
                            <span>Refresh</span>
                        </button>

                        <button
                            className="btn-primary"
                            onClick={() => {
                                setEditingUser(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <UserPlus size={18}/>
                            <span>Add User</span>
                        </button>

                        <button className="btn-secondary btn-logout" onClick={handleLogout} title="Log out">
                            <LogOut size={16}/>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Existing Admin Dashboard Content */}
            <main className="main-content">
                <div className="content-container">
                    <StatsCards users={users}/>
                    <UserTable
                        users={users}
                        onEdit={(user) => {
                            setEditingUser(user);
                            setIsModalOpen(true);
                        }}
                        onDelete={(user) => setDeletingUser(user)}
                        onOpenAddModal={() => {
                            setEditingUser(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </main>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                onSubmit={handleModalSubmit}
                initialUser={editingUser}
            />

            <DeleteConfirmModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleConfirmDelete}
                user={deletingUser}
            />
        </div>
    );
}
