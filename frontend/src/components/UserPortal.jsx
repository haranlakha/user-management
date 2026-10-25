import React, {useState} from 'react';
import {User, ShieldCheck, Mail, Calendar, Key, LogOut, CheckCircle, Edit2, Save, X} from 'lucide-react';

export default function UserPortal({user, onLogout, onUpdateSelf}) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        age: user?.age || '',
    });
    const [savedSuccess, setSavedSuccess] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (onUpdateSelf) {
            await onUpdateSelf({
                ...user,
                name: formData.name,
                email: formData.email,
                age: Number(formData.age),
            });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }
        setIsEditing(false);
    };

    return (
        <div className="user-portal-layout">
            {/* Portal Header */}
            <header className="app-header">
                <div className="header-container">
                    <div className="brand-group">
                        <div className="brand-icon">
                            <User size={22}/>
                        </div>
                        <div>
                            <div className="brand-title">User Account Portal</div>
                            <div className="brand-subtitle">Standard Member View</div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="user-pill-tag">
                            <span>Standard User</span>
                        </div>
                        <button className="btn-secondary btn-logout" onClick={onLogout}>
                            <LogOut size={16}/>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-container portal-container">
                    {/* Welcome Banner */}
                    <div className="portal-welcome-card">
                        <div className="portal-avatar">{getInitials(user?.name)}</div>
                        <div className="portal-welcome-text">
                            <h2>Welcome, {user?.name || 'User'}!</h2>
                            <p>You are logged into your personal dashboard. Your data is encrypted at rest in
                                PostgreSQL.</p>
                        </div>
                    </div>

                    {savedSuccess && (
                        <div className="toast-notification success inline-toast">
                            <CheckCircle size={18}/>
                            <span>Your profile changes have been securely saved and re-encrypted in the database!</span>
                        </div>
                    )}

                    {/* Profile Details & Security Cards */}
                    <div className="portal-grid">
                        {/* Profile Info Card */}
                        <div className="portal-card">
                            <div className="portal-card-header">
                                <h3>Personal Information</h3>
                                {!isEditing && (
                                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={14}/> Edit Profile
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSave} className="portal-edit-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                                            min="1"
                                            max="130"
                                            required
                                        />
                                    </div>
                                    <div className="portal-form-actions">
                                        <button type="button" className="btn-secondary"
                                                onClick={() => setIsEditing(false)}>
                                            <X size={14}/> Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            <Save size={14}/> Save Profile
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-fields">
                                    <div className="profile-row">
                                        <div className="profile-field-label">
                                            <User size={16}/> Name
                                        </div>
                                        <div className="profile-field-val">{user?.name}</div>
                                    </div>

                                    <div className="profile-row">
                                        <div className="profile-field-label">
                                            <Mail size={16}/> Email
                                        </div>
                                        <div className="profile-field-val">{user?.email}</div>
                                    </div>

                                    <div className="profile-row">
                                        <div className="profile-field-label">
                                            <Calendar size={16}/> Age
                                        </div>
                                        <div className="profile-field-val">{user?.age} years old</div>
                                    </div>

                                    <div className="profile-row">
                                        <div className="profile-field-label">
                                            <Key size={16}/> Database Record ID
                                        </div>
                                        <div className="profile-field-val">#{user?.id}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security & Privacy Card */}
                        <div className="portal-card security-card">
                            <div className="portal-card-header">
                                <h3>Security & Privacy</h3>
                            </div>
                            <div className="security-status-badge">
                                <ShieldCheck size={28} className="shield-green"/>
                                <div>
                                    <strong>End-to-End Database Encryption</strong>
                                    <p>AES-128 Column Level Protection</p>
                                </div>
                            </div>
                            <ul className="security-checklist">
                                <li>Your name, email, and age are encrypted before being saved into PostgreSQL.</li>
                                <li>Database administrators querying raw tables only see AES cipher text.</li>
                                <li>Your private encryption key is loaded securely from <code>postgres.conf</code>.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
