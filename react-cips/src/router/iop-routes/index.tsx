import { lazy, Suspense } from 'react';
import { IopTaskType } from '@/types/enums';
import { RoutePath } from '../routePath';
import type { AppRoute } from '../routePath';

const IopManualEntry = lazy(() => import('@/pages/iop-manual-entry'));
const IopManualAttribute = lazy(() => import('@/pages/iop-manual-attribute'));
const IopDistributeCreation = lazy(() => import('@/pages/iop-distribute-creation'));
const IopDistributeException = lazy(() => import('@/pages/iop-distribute-exception'));
const IopInquiryReply = lazy(() => import('@/pages/iop-inquiry-reply'));
const IopExceptionOut = lazy(() => import('@/pages/iop-exception-out'));

/** 免登录 IOP 业务路由。 */
export const routesIop: AppRoute[] = [
  /** 手工补录页。 */
  {
    path: RoutePath.IopManualEntry,
    element: (
      <Suspense fallback={null}>
        <IopManualEntry />
      </Suspense>
    ),
    meta: { title: 'Manual Entry' },
  },
  /** 手工归属页。 */
  {
    path: RoutePath.IopManualAttribute,
    element: (
      <Suspense fallback={null}>
        <IopManualAttribute />
      </Suspense>
    ),
    meta: { title: 'Manual Attribution' },
  },
  /** 创建分发任务页。 */
  {
    path: RoutePath.IopDistributeCreation,
    element: (
      <Suspense fallback={null}>
        <IopDistributeCreation />
      </Suspense>
    ),
    meta: { title: 'Distribution Creation' },
  },
  /** 分发异常页。 */
  {
    path: RoutePath.IopDistributeException,
    element: (
      <Suspense fallback={null}>
        <IopDistributeException />
      </Suspense>
    ),
    meta: { title: 'Distribution Exception' },
  },
  /** 查询报文回复页。 */
  {
    path: RoutePath.IopInquiryReply,
    element: (
      <Suspense fallback={null}>
        <IopInquiryReply />
      </Suspense>
    ),
    meta: { title: 'Inquiry Reply' },
  },
  /** 发报异常页。 */
  {
    path: RoutePath.IopExceptionOut,
    element: (
      <Suspense fallback={null}>
        <IopExceptionOut />
      </Suspense>
    ),
    meta: { title: 'Out Exception' },
  },
];

/** TASK_FLOW_NO 与 IOP 业务页路径的唯一映射。 */
export const IOP_TASK_ROUTE_PATHS: Readonly<Record<IopTaskType, RoutePath> & Partial<Record<string, RoutePath>>> = {
  [IopTaskType.manualEntry]: RoutePath.IopManualEntry,
  [IopTaskType.manualAttribute]: RoutePath.IopManualAttribute,
  [IopTaskType.distributeCreation]: RoutePath.IopDistributeCreation,
  [IopTaskType.distributeException]: RoutePath.IopDistributeException,
  [IopTaskType.inquiryReply]: RoutePath.IopInquiryReply,
  [IopTaskType.exceptionOut]: RoutePath.IopExceptionOut,
};
