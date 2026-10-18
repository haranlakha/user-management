// Service to communicate with the Java backend (or fallback to local mock mode)

const API_BASE_URL = '/api/users';

const INITIAL_MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice.johnson@example.com', age: 28 },
  { id: 2, name: 'Robert Smith', email: 'robert.smith@example.com', age: 34 },
  { id: 3, name: 'Elena Rostova', email: 'elena.rostova@example.com', age: 24 },
  { id: 4, name: 'Marcus Chen', email: 'marcus.chen@example.com', age: 42 },
];

function getStoredMockUsers() {
  const data = localStorage.getItem('mock_users');
  if (!data) {
    localStorage.setItem('mock_users', JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MOCK_USERS;
  }
}

function saveStoredMockUsers(users) {
  localStorage.setItem('mock_users', JSON.stringify(users));
}

export const userService = {
  async getAllUsers(useMock = false) {
    if (useMock) {
      return getStoredMockUsers();
    }
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend unavailable or mock selected, falling back to local storage:', err.message);
      return getStoredMockUsers();
    }
  },

  async createUser(userData, useMock = false) {
    if (useMock) {
      const users = getStoredMockUsers();
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        name: userData.name,
        email: userData.email,
        age: Number(userData.age),
      };
      saveStoredMockUsers([...users, newUser]);
      return newUser;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          age: Number(userData.age),
        }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend request failed, falling back to mock save:', err.message);
      return this.createUser(userData, true);
    }
  },

  async updateUser(id, userData, useMock = false) {
    if (useMock) {
      const users = getStoredMockUsers();
      const updated = users.map((u) =>
        u.id === id
          ? { ...u, name: userData.name, email: userData.email, age: Number(userData.age) }
          : u
      );
      saveStoredMockUsers(updated);
      return updated.find((u) => u.id === id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          age: Number(userData.age),
        }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('Backend request failed, updating mock:', err.message);
      return this.updateUser(id, userData, true);
    }
  },

  async deleteUser(id, useMock = false) {
    if (useMock) {
      const users = getStoredMockUsers();
      const filtered = users.filter((u) => u.id !== id);
      saveStoredMockUsers(filtered);
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return true;
    } catch (err) {
      console.warn('Backend request failed, deleting from mock:', err.message);
      return this.deleteUser(id, true);
    }
  },

  async login(usernameOrEmail, password, roleHint = 'ADMIN', useMock = false) {
    if (useMock) {
      if (roleHint === 'ADMIN' || usernameOrEmail.toLowerCase() === 'admin') {
        if (password === 'admin123' || !password) {
          return { success: true, role: 'ADMIN', user: { id: 1, username: 'admin' } };
        }
        throw new Error('Invalid Admin password. Use "admin123".');
      }

      const users = getStoredMockUsers();
      const match = users.find(
        (u) =>
          u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
          u.name.toLowerCase() === usernameOrEmail.toLowerCase()
      );
      if (match) {
        return { success: true, role: 'USER', user: match };
      }
      throw new Error(`No user found matching "${usernameOrEmail}". Try "alice.johnson@example.com".`);
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      return data;
    } catch (err) {
      console.warn('Backend /api/auth/login unreachable, trying mock login:', err.message);
      return this.login(usernameOrEmail, password, roleHint, true);
    }
  },
};
