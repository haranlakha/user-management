import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Edit3, Trash2, Mail, Lock, UserX } from 'lucide-react';

export default function UserTable({ users, onEdit, onDelete, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toString().includes(q))
      );
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchTerm, sortField, sortAsc]);

  // Generates avatar initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="table-container-card">
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="table-toolbar-meta">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
          </span>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <UserX size={40} />
          </div>
          <h4>No users found</h4>
          <p>
            {searchTerm
              ? `No user matches "${searchTerm}". Try another search term.`
              : 'There are no users in the database yet.'}
          </p>
          {!searchTerm && (
            <button className="btn-primary" onClick={onOpenAddModal}>
              Create First User
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable-th">
                  <div className="th-content">
                    ID <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="sortable-th">
                  <div className="th-content">
                    Name <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => handleSort('email')} className="sortable-th">
                  <div className="th-content">
                    Email <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => handleSort('age')} className="sortable-th">
                  <div className="th-content">
                    Age <ArrowUpDown size={14} />
                  </div>
                </th>
                <th>Storage Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-id">#{user.id}</td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">{getInitials(user.name)}</div>
                      <div className="user-name-text">
                        <strong>{user.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-email-cell">
                      <Mail size={14} className="email-icon" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="age-badge">{user.age} yrs</span>
                  </td>
                  <td>
                    <div className="encryption-pill" title="Name, email, and age are encrypted in PostgreSQL">
                      <Lock size={12} />
                      <span>Encrypted at rest</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                        aria-label="Edit user"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => onDelete(user)}
                        title="Delete user"
                        aria-label="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
