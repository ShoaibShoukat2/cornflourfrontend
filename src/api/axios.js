import axios from 'axios';

const onInstova = typeof window !== 'undefined' && (
  window.location.hostname === 'instovaearn.com' ||
  window.location.hostname === 'www.instovaearn.com'
);

const api = axios.create({
  baseURL: onInstova ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'),
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
