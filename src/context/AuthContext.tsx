import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { getToken, getUser, setToken, setUser, clearAuth } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUserState] = useState<User | null>(getUser());

  const login = (newToken: string, newUser: User) => {
    setToken(newToken); // setting in local storage
    setUser(newUser); // setting in local storage
    setTokenState(newToken);
    setUserState(newUser);
  };

  const logout = () => {
    clearAuth(); // clear local storage
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
