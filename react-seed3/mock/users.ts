export const mockUsers = [
  { id: 'U001', name: '张三', isMaker: true, isChecker: false, isAdmin: false },
  { id: 'U002', name: '李四', isMaker: false, isChecker: true, isAdmin: false },
  { id: 'U003', name: '王五', isMaker: true, isChecker: true, isAdmin: false },
  { id: 'U004', name: '赵六', isMaker: false, isChecker: false, isAdmin: true },
];

export default [
  {
    url: '/api/users',
    method: 'get',
    response: () => ({ code: 0, data: mockUsers }),
  },
  {
    url: '/api/users/save',
    method: 'post',
    response: () => ({ code: 0 }),
  },
];
