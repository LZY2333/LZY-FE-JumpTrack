import { User } from '@/types';
import { ResCode, Role } from '@/types/enums';

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
      returnCode: ResCode.Success,
      body: mockUsers.find((item) => item.id === body.id),
    }),
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({ returnCode: ResCode.Success }),
  },
  {
    url: '/api/users',
    method: 'get',
    response: () => ({ returnCode: ResCode.Success, body: mockUsers }),
  },
];
