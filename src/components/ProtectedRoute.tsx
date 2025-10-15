import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  console.log('[ProtectedRoute] Estado:', { isAuthenticated, isAdmin, isLoading, user });

  // Show loading screen with full theme support during authentication check
  // This prevents CSS from breaking during reload
  if (isLoading) {
    console.log('[ProtectedRoute] Carregando...');
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('[ProtectedRoute] Não é admin, redirecionando para display');
    return <Navigate to="/display" replace />;
  }

  console.log('[ProtectedRoute] Acesso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;
