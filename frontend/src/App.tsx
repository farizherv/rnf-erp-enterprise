import React from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { InventoryProvider } from './features/inventory/context/InventoryContext';

// ── Route Guard: renders Login or Dashboard based on auth state ──
const AppRouter: React.FC = () => {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Memuat sesi...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <InventoryProvider>
      <DashboardPage />
    </InventoryProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
