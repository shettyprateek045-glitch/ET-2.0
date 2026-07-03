"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'Admin' | 'Project Manager' | 'Engineer' | 'Contractor' | 'Client';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: UserRole, name: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, role: UserRole, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Read from localStorage on mount
    const savedUser = localStorage.getItem('epc_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole, name: string): Promise<boolean> => {
    // Perform mock login or call FastAPI auth endpoint
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'mockpassword' }) // password is mock
      });
      
      if (response.ok) {
        const data = await response.json();
        const loggedUser: User = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role as UserRole,
          token: data.token
        };
        setUser(loggedUser);
        localStorage.setItem('epc_auth_user', JSON.stringify(loggedUser));
        return true;
      }
    } catch (err) {
      console.warn("Backend connection failed, falling back to mock login state.");
    }

    // Local mock login fallback
    const mockUser: User = {
      id: Math.floor(Math.random() * 1000),
      email,
      full_name: name || "Test User",
      role,
      token: "mock-jwt-token-for-user"
    };
    setUser(mockUser);
    localStorage.setItem('epc_auth_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (email: string, role: UserRole, name: string): Promise<boolean> => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'mockpassword', full_name: name, role })
      });
      if (response.ok) {
        return await login(email, role, name);
      }
    } catch (err) {
      console.warn("Backend connection failed, falling back to mock signup.");
    }
    
    // Local fallback signup
    return await login(email, role, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('epc_auth_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
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
