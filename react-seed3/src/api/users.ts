import { User } from '@/types';
import axios from 'axios';

export const loginApi = (id: string) =>
  axios.post<{ data: User }>('/api/auth/login', { id }).then(res => res.data.data);

export const logoutApi = () => axios.post('/api/auth/logout');

export const getUsers = () => axios.get<{ data: User[] }>('/api/users').then(res => res.data.data);

export const saveUsers = (users: User[]) => axios.post('/api/users/save', { users });
