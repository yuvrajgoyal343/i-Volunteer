// AuthContext.jsx — Global authentication state
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until we verify token

  // Fetch profile from API using stored token
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('iv_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/profile');
      setUser(res.data);
    } catch {
      // Token invalid/expired — clear it
      localStorage.removeItem('iv_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Called after successful login or register
  const login = (token, userData) => {
    localStorage.setItem('iv_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('iv_token');
    setUser(null);
  };

  const refreshProfile = () => fetchProfile();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
