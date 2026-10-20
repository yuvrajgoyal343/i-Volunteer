// AuthContext.jsx — Global authentication state using React useState (in-memory)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import api, { setToken as apiSetToken, clearToken as apiClearToken } from '../api';
import { clearDonations } from '../store/donationsSlice';
import AuthContext from './AuthContextValue';

function readStoredSession() {
  try {
    const local = localStorage.getItem('ivolunteer_token') || localStorage.getItem('iv_token');
    if (local) return { token: local, isPersistent: true };
    const session = sessionStorage.getItem('ivolunteer_token') || sessionStorage.getItem('iv_token');
    if (session) return { token: session, isPersistent: false };
    return { token: null, isPersistent: false };
  } catch {
    return { token: null, isPersistent: false };
  }
}

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => {
    const session = readStoredSession();
    if (session.token) {
      apiSetToken(session.token, session.isPersistent);
      return session.token;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => Boolean(readStoredSession().token));

  // Fetch profile from API using current token/state
  const fetchProfile = useCallback(async () => {
    const session = readStoredSession();
    const activeToken = token || session.token;
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      apiSetToken(activeToken, session.isPersistent);
      const res = await api.get('/profile');
      setUser(res.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
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
  const login = useCallback((newToken, userData, remember = true) => {
    apiSetToken(newToken, remember);
    dispatch(clearDonations());
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  }, [dispatch]);

  const logout = useCallback(() => {
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
