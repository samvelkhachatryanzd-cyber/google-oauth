import axios from 'axios';

// Relative URL: in development Vite proxies /api to the backend (see vite.config.js).
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
