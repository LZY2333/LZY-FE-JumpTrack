import { User } from '@/types';
import { Role } from '@/types/enums';

export const mockUsers: User[] = [
  { id: 'U001', name: '张三', roles: [Role.Maker] },
  { id: 'U002', name: '李四', roles: [Role.Checker] },
  { id: 'U003', name: '王五', roles: [Role.Maker, Role.Checker] },
];

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: { id: string } }) => ({
      code: 0,
      data: mockUsers.find(u => u.id === body.id),
    }),
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({ code: 0 }),
  },
  {
    url: '/api/users',
    method: 'get',
    response: () => ({ code: 0, data: mockUsers }),
  },
];
