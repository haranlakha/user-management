// Service to communicate with the Java backend (or local mock mode when switched on)

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

// Calls the backend; never falls back to mock data (mock mode is opt-in via the toggle)
async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Can't reach the server. Check that the backend is running.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Server error (${response.status})`);
  }
  return data;
}

export const userService = {
  async getAllUsers(useMock = false) {
    if (useMock) {
      return getStoredMockUsers();
    }
    return request(API_BASE_URL);
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

    return request(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        age: Number(userData.age),
      }),
    });
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

    return request(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        age: Number(userData.age),
      }),
    });
  },

  async deleteUser(id, useMock = false) {
    if (useMock) {
      const users = getStoredMockUsers();
      const filtered = users.filter((u) => u.id !== id);
      saveStoredMockUsers(filtered);
      return true;
    }

    await request(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    return true;
  },

  async login(usernameOrEmail, password, roleHint = 'ADMIN', useMock = false) {
    if (useMock) {
      if (roleHint === 'ADMIN' || usernameOrEmail.toLowerCase() === 'admin') {
        if (password === 'admin123') {
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

    return request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  async register(registerData, useMock = false) {
    if (useMock) {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (registerData.role === 'ADMIN') {
        throw new Error('Admin accounts cannot be created through registration.');
      }

      // Standard user mock registration
      const users = getStoredMockUsers();
      if (users.some((u) => u.email.toLowerCase() === registerData.email.toLowerCase())) {
        throw new Error('Email is already registered in mock storage');
      }

      const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        name: registerData.name,
        email: registerData.email,
        age: Number(registerData.age),
      };
      saveStoredMockUsers([...users, newUser]);
      return { success: true, role: 'USER', user: newUser };
    }

    return request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
  },
};
