import type { ReactElement } from 'react';
import KeepAlive from 'react-activation';
import { Navigate } from 'react-router-dom';
import TaskPool from '@/pages/task-pool';
import TaskDetail from '@/pages/task-detail';
import { Role } from '@/types/enums';

export enum RoutePath {
  Root = '/',
  TaskPool = '/tasks',
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
    path: RoutePath.Root,
    element: <Navigate to={RoutePath.TaskPool} replace />,
    meta: { title: 'Redirect to Task Pool' },
  },
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
