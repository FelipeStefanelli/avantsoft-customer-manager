/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as doLogin, logout as doLogout } from '../services/authService';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('toyshop_token'));

  useEffect(() => {
    if (token) localStorage.setItem('toyshop_token', token);
    else localStorage.removeItem('toyshop_token');
  }, [token]);

  const login = async (email: string, password: string) => {
    const jwt = await doLogin(email, password);
    setToken(jwt);
  };

  const logout = () => {
    doLogout();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
