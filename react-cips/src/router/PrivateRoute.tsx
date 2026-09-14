import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/enums';
import { RoutePath } from '@/router/routes';

export default function PrivateRoute({ role, children }: { role: Role; children: ReactElement }) {
  const { user } = useUserStore();
  if (!user) return null;
  return user.roles.includes(role) ? children : <Navigate to={RoutePath.MessageList} replace />;
}
