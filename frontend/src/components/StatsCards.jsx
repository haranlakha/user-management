import React from 'react';
import {Users, Calendar, ShieldCheck, Database} from 'lucide-react';

export default function StatsCards({users}) {
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
                <div className="stat-icon-wrapper green">
                    <ShieldCheck size={22}/>
                </div>
                <div className="stat-content">
                    <div className="stat-label">DB Encryption</div>
                    <div className="stat-value">AES-256-GCM</div>
                    <div className="stat-hint">Key loaded from postgresql.conf</div>
                </div>
            </div>
        </div>
    );
}
