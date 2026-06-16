import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppLayout from '../layout/AppLayout';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}
