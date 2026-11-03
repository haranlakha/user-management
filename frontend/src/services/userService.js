// Service to communicate with the Java backend

const API_BASE_URL = '/api/users';

function csrfHeader() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);

    return match ? {'X-XSRF-TOKEN': decodeURIComponent(match[1])} : null;
}

async function request(url, options = {}) {
    let response;
    try {
        response = await fetch(url, {...options, headers: {...options.headers, ...csrfHeader()}});
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
    async getAllUsers() {
        return request(API_BASE_URL);
    },

    async createUser(userData) {
        return request(API_BASE_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                age: Number(userData.age),
            }),
        });
    },

    async updateUser(id, userData) {
        return request(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                age: Number(userData.age),
            }),
        });
    },

    async deleteUser(id) {
        await request(`${API_BASE_URL}/${id}`, {method: 'DELETE'});
        return true;
    },

    async login(usernameOrEmail, password) {
        return request('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usernameOrEmail, password}),
        });
    },

    async register(registerData) {
        return request('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(registerData),
        });
    },

    async init() {
        await request('/api/auth/csrf');

        try {
            return await request('/api/auth/me');
        } catch {
            return null;
        }
    },

    async logout() {
        await request('/api/auth/logout', {method: 'POST'});
        await request('/api/auth/csrf');
    }
};
