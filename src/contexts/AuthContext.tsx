'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ role: 'ADMIN' | 'USER' }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const response = await authApi.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ role: 'ADMIN' | 'USER' }> => {
    try {
      console.log('AuthContext: Calling login API');
      const response = await authApi.login({ email, password });
      console.log('AuthContext: API response:', response);
      
      if (response && response.success && response.data) {
        console.log('AuthContext: Setting token');
        Cookies.set('token', response.data.token, { expires: 7 });
        
        // Since backend doesn't return full user object, we'll get it from profile API
        try {
          const profileResponse = await authApi.getProfile();
          console.log('AuthContext: Profile response:', profileResponse);
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          }
        } catch (profileError) {
          console.warn('AuthContext: Could not fetch profile:', profileError);
          // Create minimal user object from login response
          const tempUser: User = {
            id: 'temp',
            email: email,
            nama: 'User',
            nomorhp: '',
            role: response.data.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(tempUser);
        }
        
        return { role: response.data.role };
      } else {
        const message = response?.message || 'Login failed - invalid response';
        console.error('AuthContext: Login failed:', message);
        throw new Error(message);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}