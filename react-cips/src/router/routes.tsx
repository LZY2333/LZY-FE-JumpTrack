import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import { Navigate } from 'react-router-dom';
import MessageList from '@/pages/message-list';
import MessageDetail from '@/pages/message-detail';
import LcwList from '@/pages/lcw-list';
import { Role } from '@/types/enums';

/** 应用页面路径；登录和用户权限继续沿用现有入口。 */
export enum RoutePath {
  Root = '/',
  MessageList = '/messages',
  MessageDetail = '/messages/:msgDirection/:businessType/:msgId',
  LcwList = '/lcw',
}

export const routes: AppRoute[] = [
  {
    path: RoutePath.Root,
    element: <Navigate to={RoutePath.MessageList} replace />,
    meta: { title: 'Message List' },
  },
  {
    path: RoutePath.MessageList,
    element: (
      <KeepAlive name='message-list'>
        <MessageList />
      </KeepAlive>
    ),
    meta: { title: 'Message List' },
  },
  {
    path: RoutePath.MessageDetail,
    element: <MessageDetail />,
    meta: { title: 'Message Details' },
  },
  {
    path: RoutePath.LcwList,
    element: (
      <KeepAlive name='lcw-list'>
        <LcwList />
      </KeepAlive>
    ),
    meta: { title: 'LCW Tasks' },
  },
];

export interface AppRoute {
  path: string;
  element: ReactElement;
  meta: { title: string };
  role?: Role;
}
