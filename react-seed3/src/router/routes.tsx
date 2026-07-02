import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import TaskPool from '@/pages/task-pool';
import TaskDetail from '@/pages/task-detail';
import { Role } from '@/types/enums';

export interface AppRoute {
  path: string;
  element: ReactElement;
  meta: { title: string };
  role?: Role;
}

export const routes: AppRoute[] = [
  { path: '/', element: <KeepAlive name="task-pool"><TaskPool /></KeepAlive>, meta: { title: '任务池' } },
  { path: '/task/:id', element: <TaskDetail />, meta: { title: '任务详情' } },
];
