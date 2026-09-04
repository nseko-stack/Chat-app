import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulsechat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register attempt failure
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('pulsechat_token');
        localStorage.removeItem('pulsechat_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  getUsers: async (search = '') => {
    const res = await api.get('/users', {
      params: search ? { search } : {},
    });
    return res.data;
  },
};

export const conversationAPI = {
  getConversations: async () => {
    const res = await api.get('/conversations');
    return res.data;
  },
  createConversation: async (userId) => {
    const res = await api.post('/conversations', { userId });
    return res.data;
  },
};

export const messageAPI = {
  getMessages: async (conversationId) => {
    const res = await api.get(`/messages/${conversationId}`);
    return res.data;
  },
  sendMessage: async ({ conversationId, text }) => {
    const res = await api.post('/messages', { conversationId, text });
    return res.data;
  },
};

export default api;
