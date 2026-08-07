import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import TaskPool from '@/pages/task-pool';
import TaskDetail from '@/pages/task-detail';
import { Role } from '@/types/enums';

export enum RoutePath {
  TaskPool = '/',
  TaskDetail = '/task/:taskId',
}

export interface AppRoute {
  path: string;
  element: ReactElement;
  meta: { title: string };
  role?: Role;
}

export const routes: AppRoute[] = [
  {
    path: RoutePath.TaskPool,
    element: (
      <KeepAlive name='task-pool'>
        <TaskPool />
      </KeepAlive>
    ),
    meta: { title: 'Task Pool' },
  },
  { path: RoutePath.TaskDetail, element: <TaskDetail />, meta: { title: 'Task Detail' } },
];
