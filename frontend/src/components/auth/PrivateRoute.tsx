import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lawfy-accent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-lawfy-primary"></div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}