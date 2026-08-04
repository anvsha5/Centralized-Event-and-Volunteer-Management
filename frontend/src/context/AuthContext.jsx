import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe(token);
        setUserId(userData.id);
        setRole(userData.role);
        setUser(userData);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('role', userData.role);
      } catch (err) {
        console.error('Session sync error:', err);
        // Clear invalid token
        setToken(null);
        setUserId(null);
        setRole(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
      } finally {
        setLoading(false);
      }
    }
    syncUser();
  }, [token]);

  const login = (authData) => {
    const { token: newToken, user: newUser } = authData;
    setToken(newToken);
    setUserId(newUser.id);
    setRole(newUser.role);
    setUser(newUser);

    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUser.id);
    localStorage.setItem('role', newUser.role);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  };

  const value = useMemo(
    () => ({
      token,
      userId,
      role,
      user,
      loading,
      login,
      logout,
      setToken,
      setUserId,
      setRole,
    }),
    [token, userId, role, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
