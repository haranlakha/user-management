import React from 'react';
import {Users, Calendar, ShieldCheck, Database} from 'lucide-react';

export default function StatsCards({users, useMock, onToggleMock}) {
    const totalUsers = users.length;
    const avgAge =
        totalUsers > 0
            ? Math.round(users.reduce((acc, u) => acc + (Number(u.age) || 0), 0) / totalUsers)
            : 0;

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                    <Users size={22}/>
                </div>
                <div className="stat-content">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{totalUsers}</div>
                    <div className="stat-hint">Active entity records</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper amber">
                    <Calendar size={22}/>
                </div>
                <div className="stat-content">
                    <div className="stat-label">Average Age</div>
                    <div className="stat-value">{avgAge > 0 ? `${avgAge} yrs` : 'N/A'}</div>
                    <div className="stat-hint">Calculated across userbase</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper green">
                    <ShieldCheck size={22}/>
                </div>
                <div className="stat-content">
                    <div className="stat-label">DB Encryption</div>
                    <div className="stat-value">AES-128</div>
                    <div className="stat-hint">Key loaded from postgres.conf</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon-wrapper purple">
                    <Database size={22}/>
                </div>
                <div className="stat-content">
                    <div className="stat-label">Data Source</div>
                    <div className="stat-toggle-row">
            <span className={`status-pill ${useMock ? 'pill-mock' : 'pill-live'}`}>
              {useMock ? 'Local Demo Mode' : 'Live /api/users'}
            </span>
                        <button
                            className="btn-toggle-mode"
                            onClick={onToggleMock}
                            title="Toggle between mock data and real backend API"
                        >
                            Switch to {useMock ? 'Live' : 'Mock'}
                        </button>
                    </div>
                    <div className="stat-hint">
                        {useMock ? 'Testing without backend running' : 'Connecting to Spring/Hibernate server'}
                    </div>
                </div>
            </div>
        </div>
    );
}
