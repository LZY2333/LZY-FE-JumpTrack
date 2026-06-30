import { User } from '@/types';
import request, { ApiResult } from './request';

export const loginApi = (id: string) =>
  request.post<ApiResult<User>, ApiResult<User>>('/api/auth/login', { id }).then(res => res.data);

export const logoutApi = () => request.post('/api/auth/logout');

export const getUsers = () =>
  request.get<ApiResult<User[]>, ApiResult<User[]>>('/api/users').then(res => res.data);
