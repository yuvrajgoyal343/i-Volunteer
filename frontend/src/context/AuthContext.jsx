// AuthContext.jsx — Global authentication state using React useState (in-memory)
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setToken as apiSetToken, clearToken as apiClearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile from API using current in-memory token/state
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/profile');
      setUser(res.data);
    } catch {
      // Token invalid/expired — clear it
      if (apiClearToken) apiClearToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [fetchProfile, token]);

  // Called after successful login or register
  const login = (newToken, userData) => {
    if (apiSetToken) apiSetToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    if (apiClearToken) apiClearToken();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = () => fetchProfile();

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
