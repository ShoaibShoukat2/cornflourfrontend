import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

const savedUser = () => {
  try {
    const raw = sessionStorage.getItem('instova_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const rememberUser = (next) => {
  if (!next) {
    sessionStorage.removeItem('instova_user');
    return;
  }
  const stored = { ...next };
  delete stored.profile_picture;
  try {
    sessionStorage.setItem('instova_user', JSON.stringify(stored));
  } catch {
    /* A full-size photo must not block the next page open. */
  }
};

export const AuthProvider = ({ children }) => {
  const cached = typeof localStorage !== 'undefined' && localStorage.getItem('token') ? savedUser() : null;
  const [user, setUser] = useState(cached);
  const [loading, setLoading] = useState(Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('token')) && !cached);

  const applyUser = (next) => {
    setUser((current) => {
      if (!next) return null;
      const sentPicture = Object.prototype.hasOwnProperty.call(next, 'profile_picture');
      if (!sentPicture && current?.profile_picture && current.id === next.id) {
        return { ...next, profile_picture: current.profile_picture };
      }
      return next;
    });
    rememberUser(next);
  };

  const loadPicture = () => {
    window.setTimeout(() => {
      api.get('/auth/profile/', { quiet: true }).then((res) => {
        if (res.data?.profile_picture) applyUser(res.data);
      }).catch(() => {});
    }, 1200);
  };

  const fetchUser = async (quiet = false) => {
    try {
      const response = await api.get('/auth/profile/', { params: { lite: 1 }, quiet });
      applyUser(response.data);
      if (!response.data?.is_staff) loadPicture();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        applyUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return undefined;
    }
    // A saved session can open the dashboard immediately. Refresh the profile
    // after the overview request, so the two do not fight for the same worker.
    if (savedUser()) {
      const timer = window.setTimeout(() => { fetchUser(true); }, 8000);
      return () => window.clearTimeout(timer);
    }
    fetchUser(false);
    return undefined;
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    localStorage.setItem('token', response.data.token);
    applyUser(response.data.user);
    if (!response.data.user?.is_staff) loadPicture();
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    localStorage.setItem('token', response.data.token);
    applyUser(response.data.user);
    loadPicture();
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem('token');
    applyUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser, applyUser }}>
      {children}
    </AuthContext.Provider>
  );
};
