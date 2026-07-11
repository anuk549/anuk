import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Loading from './Loading';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
