// AuthContext.jsx — Global authentication state using React useState (in-memory)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import api, { setToken as apiSetToken, clearToken as apiClearToken } from '../api';
import { clearDonations } from '../store/donationsSlice';
import AuthContext from './AuthContextValue';

function readStoredToken() {
  try {
    return localStorage.getItem('ivolunteer_token');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => {
    const saved = readStoredToken();
    if (saved) apiSetToken(saved);
    return saved;
  });
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()));

  // Fetch profile from API using current token/state
  const fetchProfile = useCallback(async () => {
    const activeToken = token;
    if (!activeToken) {
      return;
    }
    try {
      apiSetToken(activeToken);
      const res = await api.get('/profile');
      setUser(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        try { localStorage.removeItem('ivolunteer_token'); } catch {}
        apiClearToken();
        dispatch(clearDonations());
        setToken(null);
        setUser(null);
      } else {
        console.error('Failed to load the authenticated profile.', error);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  // The async request owns loading and profile updates until it settles.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  // Called after successful login or register
  const login = useCallback((newToken, userData) => {
    try { localStorage.setItem('ivolunteer_token', newToken); } catch {}
    apiSetToken(newToken);
    dispatch(clearDonations());
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  }, [dispatch]);

  const logout = useCallback(() => {
    try { localStorage.removeItem('ivolunteer_token'); } catch {}
    apiClearToken();
    dispatch(clearDonations());
    setToken(null);
    setUser(null);
    setLoading(false);
  }, [dispatch]);

  const refreshProfile = useCallback(() => fetchProfile(), [fetchProfile]);
  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshProfile }),
    [user, token, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
