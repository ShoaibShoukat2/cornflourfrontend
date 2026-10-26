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
  if (next) sessionStorage.setItem('instova_user', JSON.stringify(next));
  else sessionStorage.removeItem('instova_user');
};

export const AuthProvider = ({ children }) => {
  const cached = typeof localStorage !== 'undefined' && localStorage.getItem('token') ? savedUser() : null;
  const [user, setUser] = useState(cached);
  const [loading, setLoading] = useState(Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('token')) && !cached);

  const applyUser = (next) => {
    setUser(next);
    rememberUser(next);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile/');
      applyUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        applyUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    localStorage.setItem('token', response.data.token);
    applyUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    localStorage.setItem('token', response.data.token);
    applyUser(response.data.user);
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
