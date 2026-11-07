import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and attach JWT token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('bizwebcheck_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Intercept response errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login failure attempts
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('bizwebcheck_token');
        localStorage.removeItem('bizwebcheck_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
