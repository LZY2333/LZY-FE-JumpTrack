import type { ReactElement } from 'react';
import type { Role } from '@/types/enums';

/** 应用页路径。 */
export enum RoutePath {
  Root = '/',
  MessageList = '/messages',
  MessageDetail = '/messages/:msgDirection/:businessType/:msgId',
  LcwList = '/lcw',

  IopRoot = '/iop',
  IopManualEntry = '/iop/manual-entry',
  IopManualAttribute = '/iop/manual-attribute',
  IopDistributeCreation = '/iop/distribute-creation',
  IopDistributeException = '/iop/distribute-exception',
  IopInquiryPayment = '/iop/inquiry-payment',
  IopInquiryReply = '/iop/inquiry-reply',
  IopExceptionOut = '/iop/exception-out',
}

export interface AppRouteMeta {
  /** 页面标题。 */
  title: string;
}

export interface AppRoute {
  /** 路由路径。 */
  path: string;
  /** 路由页面元素。 */
  element: ReactElement;
  /** 路由元信息。 */
  meta: AppRouteMeta;
  /** 访问页面所需角色。 */
  role?: Role;
}
