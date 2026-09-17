import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/enums';
import { RoutePath } from '../routePath';

interface PrivateRouteProps {
  /** 访问页面所需角色。 */
  role: Role;
  /** 通过权限校验后展示的页面。 */
  children: ReactElement;
}

/** 校验当前用户是否具备页面所需角色。 */
const PrivateRoute = ({ role, children }: PrivateRouteProps) => {
  const { user } = useUserStore();
  if (!user) return null;
  return user.roles.includes(role) ? children : <Navigate to={RoutePath.MessageList} replace />;
};

export default PrivateRoute;
