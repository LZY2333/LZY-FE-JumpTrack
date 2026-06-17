import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import TaskPool from '@/pages/task-pool';
import MakerPage from '@/pages/maker-page';
import CheckerPage from '@/pages/checker-page';
import Permission from '@/pages/permissions';
import { Role } from '@/types/enums';

export interface AppRoute {
  path: string;
  element: ReactElement;
  meta: { title: string };
  role?: Role;
}

export const routes: AppRoute[] = [
  { path: '/', element: <KeepAlive name="task-pool"><TaskPool /></KeepAlive>, meta: { title: '任务池' } },
  { path: '/task/maker/:id', element: <MakerPage />, meta: { title: '填报任务' } },
  { path: '/task/checker/:id', element: <CheckerPage />, meta: { title: '审核任务' } },
  { path: '/admin/permissions', element: <Permission />, meta: { title: '权限配置' }, role: Role.Admin },
];
