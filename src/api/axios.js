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
const inflight = new Map();
const cacheKey = (url) => `api-cache:${url}`;

export const requestKey = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  const search = new URLSearchParams();
  Object.keys(params).sort().forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null) search.append(key, String(value));
  });
  const text = search.toString();
  return text ? `${url}?${text}` : url;
};

const writeCache = (url, data) => {
  cache.set(url, data);
  try {
    const raw = JSON.stringify(data);
    const limit = String(url).includes('contact-links') ? 1500000 : 80000;
    if (raw.length > limit) return;
    sessionStorage.setItem(cacheKey(url), raw);
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
  if (config.quiet) return config;
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
    if (response.config.quiet) return response;
    pending = Math.max(0, pending - 1);
    if ((response.config.method || 'get').toLowerCase() === 'get') {
      writeCache(requestKey(response.config.url, response.config.params), response.data);
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
    if (error.config?.quiet) return Promise.reject(error);
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

const originalGet = api.get.bind(api);
api.get = (url, config = {}) => {
  const key = requestKey(url, config.params);
  const existing = inflight.get(key);
  if (existing) return existing;
  const request = originalGet(url, config).finally(() => {
    if (inflight.get(key) === request) inflight.delete(key);
  });
  inflight.set(key, request);
  return request;
};

export default api;
