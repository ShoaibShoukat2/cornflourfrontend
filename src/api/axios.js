import axios from 'axios';

const onInstova = typeof window !== 'undefined' && (
  window.location.hostname === 'instovaearn.com' ||
  window.location.hostname === 'www.instovaearn.com'
);

const api = axios.create({
  baseURL: onInstova ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'),
  timeout: 25000,
});

const cache = new Map();
const cacheKey = (url) => `api-cache:${url}`;
const writeCache = (url, data) => {
  cache.set(url, data);
  try {
    sessionStorage.setItem(cacheKey(url), JSON.stringify(data));
  } catch {
    /* Large responses stay in memory only. */
  }
};
const listeners = new Set();
let pending = 0;
let slowTimer = null;
let netState = { kind: 'ok', message: '' };

const emit = (next) => {
  netState = next;
  listeners.forEach((listener) => listener(netState));
};

const armSlowTimer = () => {
  if (slowTimer || pending === 0) return;
  slowTimer = setTimeout(() => {
    slowTimer = null;
    if (pending > 0 && netState.kind !== 'offline') {
      emit({ kind: 'slow', message: 'Internet is slow. Your data is still loading.' });
    }
  }, 1400);
};

export const subscribeNetwork = (listener) => {
  listeners.add(listener);
  listener(netState);
  return () => listeners.delete(listener);
};

export const readCache = (url) => {
  if (cache.has(url)) return cache.get(url);
  try {
    const raw = sessionStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const data = JSON.parse(raw);
    cache.set(url, data);
    return data;
  } catch {
    return null;
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    emit({ kind: 'offline', message: 'No internet connection. Data will appear when you are back online.' });
  });
  window.addEventListener('online', () => {
    if (pending > 0) emit({ kind: 'slow', message: 'Back online. Loading your data now.' });
    else emit({ kind: 'ok', message: '' });
  });
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  pending += 1;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    emit({ kind: 'offline', message: 'No internet connection. Data will appear when you are back online.' });
  } else {
    armSlowTimer();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    pending = Math.max(0, pending - 1);
    if ((response.config.method || 'get').toLowerCase() === 'get') {
      writeCache(response.config.url, response.data);
    }
    if (pending === 0) {
      if (slowTimer) {
        clearTimeout(slowTimer);
        slowTimer = null;
      }
      if (netState.kind !== 'offline') emit({ kind: 'ok', message: '' });
    }
    return response;
  },
  (error) => {
    pending = Math.max(0, pending - 1);
    if (pending === 0 && slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      emit({ kind: 'offline', message: 'No internet connection. Data will appear when you are back online.' });
    } else if (!error.response || error.code === 'ECONNABORTED') {
      emit({
        kind: 'error',
        message: error.code === 'ECONNABORTED'
          ? 'The server is taking too long. This is a slow connection, not missing data.'
          : 'Data could not load. Please check your internet connection.',
      });
    }
    return Promise.reject(error);
  }
);

export default api;
