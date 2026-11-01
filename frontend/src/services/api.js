import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('focusdesk:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// =========================================================
// Auth
// =========================================================
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
};

// =========================================================
// Tasks
// =========================================================
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// =========================================================
// Projects
// =========================================================
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// =========================================================
// Notifications
// =========================================================
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (ids) => api.patch('/notifications/read', { ids }),
};

// =========================================================
// AI
// =========================================================
export const aiApi = {
  suggest: (title, context) => api.post('/ai/suggest', { title, context }),
};

// =========================================================
// Health / Performance
// =========================================================
export const systemApi = {
  health: () => api.get('/health'),
  performance: () => api.get('/performance'),
};

export default api;
