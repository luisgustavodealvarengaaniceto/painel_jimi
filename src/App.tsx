import React from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AkrozLoginPage from './pages/AkrozLoginPage';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalStyles from './styles/GlobalStyles';
import { getThemeByTenant } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data is immediately stale for TV display
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnMount: true, // Always refetch on component mount
      retry: (failureCount, error: any) => {
        // Don't retry auth errors or permission errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry auth errors, permission errors, or validation errors
        if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 422) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
    },
  },
});

// Dynamic Theme Provider based on user tenant
function DynamicThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const tenant = user?.tenant || 'default';
  const theme = React.useMemo(() => getThemeByTenant(tenant), [tenant]);
  
  // Keep theme stable during auth loading to prevent CSS flash
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DynamicThemeProvider>
            <GlobalStyles />
            <Router>
              <Routes>
                <Route path="/login" element={<AkrozLoginPage />} />
                <Route path="/jimi-login" element={<LoginPage />} />
                <Route 
                  path="/display" 
                  element={
                    <ProtectedRoute>
                      <DisplayPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<AkrozLoginPage />} />
              </Routes>
            </Router>
          </DynamicThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
