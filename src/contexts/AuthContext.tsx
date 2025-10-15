import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  clearCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] Verificando autenticação...');
        const token = localStorage.getItem('authToken');
        if (token) {
          console.log('[AuthContext] Token encontrado, verificando com servidor...');
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout')), 10000)
          );
          
          const userData = await Promise.race([
            authService.me(),
            timeoutPromise
          ]);
          
          console.log('[AuthContext] Usuário autenticado:', userData);
          setUser(userData as any);
        } else {
          console.log('[AuthContext] Nenhum token encontrado');
        }
      } catch (error) {
        console.error('[AuthContext] Erro na verificação de auth:', error);
        // Token is invalid or network error, remove it
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        console.log('[AuthContext] Verificação de auth finalizada');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear all cache before login to prevent cross-tenant contamination
      queryClient.clear();
      
      const response = await authService.login(username, password);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    
    // Clear all cache on logout
    queryClient.clear();
  };

  const clearCache = () => {
    queryClient.clear();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    clearCache,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
