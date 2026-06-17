import axios from 'axios';
import type { Task, TaskDetail } from '@/types';

export const getTasks = () =>
  axios.get<{ data: Task[] }>('/api/tasks').then(res => res.data.data);

export const getTask = (id: string) =>
  axios.get<{ data: TaskDetail }>(`/api/task/${id}`).then(res => res.data.data);

export const submitTask = (id: string, task: TaskDetail) =>
  axios.post(`/api/task/submit/${id}`, task);

export const returnTask = (id: string) =>
  axios.post(`/api/task/return/${id}`);

export const approveTask = (id: string) =>
  axios.post(`/api/task/approve/${id}`);
