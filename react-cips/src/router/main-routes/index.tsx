import { lazy, Suspense } from 'react';
import KeepAlive from 'react-activation';
import { Navigate } from 'react-router-dom';
import { RoutePath } from '../routePath';
import type { AppRoute } from '../routePath';

const MessageList = lazy(() => import('@/pages/message-list'));
const MessageDetail = lazy(() => import('@/pages/message-detail'));
const LcwList = lazy(() => import('@/pages/lcw-list'));

/** 需要登录并使用主布局的业务路由。 */
export const mainRoutes: AppRoute[] = [
  /** 默认入口：跳转报文列表页。 */
  {
    path: RoutePath.Root,
    element: <Navigate to={{ pathname: RoutePath.MessageList, search: window.location.search }} replace />,
    meta: { title: 'Message List' },
  },
  /** 报文列表页。 */
  {
    path: RoutePath.MessageList,
    element: (
      <KeepAlive name='message-list' cacheKey='main-message-list'>
        <Suspense fallback={null}>
          <MessageList />
        </Suspense>
      </KeepAlive>
    ),
    meta: { title: 'Message List' },
  },
  /** 报文详情页。 */
  {
    path: RoutePath.MessageDetail,
    element: (
      <Suspense fallback={null}>
        <MessageDetail />
      </Suspense>
    ),
    meta: { title: 'Message Details' },
  },
  /** 反洗钱任务列表页。 */
  {
    path: RoutePath.LcwList,
    element: (
      <KeepAlive name='lcw-list' cacheKey='main-lcw-list'>
        <Suspense fallback={null}>
          <LcwList />
        </Suspense>
      </KeepAlive>
    ),
    meta: { title: 'LCW Tasks' },
  },
];

export { default as MainGuard } from './MainGuard';
export { default as PrivateRoute } from './PrivateRoute';
