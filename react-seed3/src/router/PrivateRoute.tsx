import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { Role } from '@/types/enums';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  return user.roles.includes(Role.Admin) ? <>{children}</> : <Navigate to="/" replace />;
}
