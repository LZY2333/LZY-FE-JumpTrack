import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import { Navigate } from 'react-router-dom';
import MessageList from '@/pages/message-list';
import MessageDetail from '@/pages/message-detail';
import { Role } from '@/types/enums';
import { RoutePath } from './paths';

export { RoutePath } from './paths';

export interface AppRoute {
  path: string;
  element: ReactElement;
  meta: { title: string };
  role?: Role;
}

export const routes: AppRoute[] = [
  {
    path: RoutePath.Root,
    element: <Navigate to={RoutePath.MessageList} replace />,
    meta: { title: '报文列表' },
  },
  {
    path: RoutePath.MessageList,
    element: (
      <KeepAlive name='message-list'>
        <MessageList />
      </KeepAlive>
    ),
    meta: { title: '报文列表' },
  },
  {
    path: RoutePath.MessageDetail,
    element: <MessageDetail />,
    meta: { title: '报文明细' },
  },
];
