'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting mock login with:', email);
      
      // Mock successful login response
      const mockUserData = {
        id: 1,
        email: email,
        full_name: 'Test User',
        role: 'admin' as const
      };
      
      // Store a mock token in localStorage
      const mockToken = 'mock_token_for_testing';
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setUser(mockUserData);
      
      console.log('Mock login successful:', mockUserData);
      
      /* Temporarily commenting out actual API call
      console.log('Attempting login with:', email);
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Login response:', response.data);
      const { access_token, token_type, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      
      // If user data is provided directly in the response
      if (userData) {
        setUser(userData);
      } 
      // If no user data is in the response, fetch it separately
      else {
        const userResponse = await api.get('/auth/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        setUser(userResponse.data);
      }
      */
    } catch (error: any) {
      console.error('Login error:', error.response?.data?.detail || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
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