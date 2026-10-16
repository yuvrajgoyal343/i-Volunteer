// AuthContext.jsx — Global authentication state using React useState (in-memory)
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setToken as apiSetToken, clearToken as apiClearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => {
    try {
      const saved = localStorage.getItem('ivolunteer_token');
      if (saved) {
        if (apiSetToken) apiSetToken(saved);
        return saved;
      }
      const demoToken = 'mock_token_1_demo';
      if (apiSetToken) apiSetToken(demoToken);
      localStorage.setItem('ivolunteer_token', demoToken);
      return demoToken;
    } catch {
      return 'mock_token_1_demo';
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile from API using current token/state
  const fetchProfile = useCallback(async () => {
    const activeToken = token || localStorage.getItem('ivolunteer_token');
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      if (apiSetToken) apiSetToken(activeToken);
      const res = await api.get('/profile');
      setUser(res.data);
    } catch {
      // Token invalid/expired — clear it
      try { localStorage.removeItem('ivolunteer_token'); } catch {}
      if (apiClearToken) apiClearToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Called after successful login or register
  const login = (newToken, userData) => {
    try { localStorage.setItem('ivolunteer_token', newToken); } catch {}
    if (apiSetToken) apiSetToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    try { localStorage.removeItem('ivolunteer_token'); } catch {}
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
