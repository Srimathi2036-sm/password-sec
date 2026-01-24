import React, { createContext, useContext, useState } from 'react';
import { createUser, getUserByEmail, changePassword, mfaGenerate } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePassword?: (email: string, current: string, next: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      let res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      let data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // if MFA required, trigger OTP and prompt user
        if (data && typeof data.error === 'string' && data.error.toLowerCase().includes('otp')) {
          await mfaGenerate(email);
          const otp = window.prompt('Enter the OTP sent to your email');
          if (!otp) return false;
          res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, otp }) });
          data = await res.json().catch(() => ({}));
        } else {
          return false;
        }
      }
      if (!res.ok) return false;
      const u: User = { id: data.user.id, name: data.user.username, email: data.user.email };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('session', JSON.stringify({ userId: data.user.id, email: data.user.email, token: data.token }));
      return true;
    } catch (e) {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // create user but do not auto-login
    if (!name || !email || password.length < 8) return false;
    const ok = await createUser(name, email, password);
    return ok;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('session');
  };

  const updatePassword = async (email: string, current: string, next: string): Promise<boolean> => {
    return changePassword(email, current, next);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
