import { User } from '@/types';
import { get, post } from './request';

export const loginApi = (id: string) => post<User>('/api/auth/login', { id });

export const logoutApi = () => post('/api/auth/logout');

export const getUsers = () => get<User[]>('/api/users');
