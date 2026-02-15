// Helper untuk semua request ke backend
const BACKEND_URL = 'http://localhost:8000'; // ganti ke URL Railway setelah deploy

const api = {
  getToken: () => localStorage.getItem('token'),

  async request(path, options = {}) {
    const token = this.getToken();
    const res = await fetch(`${BACKEND_URL}${path}`, {  // ← backtick diperbaiki
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/index.html';
      return;
    }

    return res.json();
  },

  get: (path) => api.request(path),
  post: (path, body) => api.request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => api.request(path, { method: 'PUT', body: JSON.stringify(body) }),
};