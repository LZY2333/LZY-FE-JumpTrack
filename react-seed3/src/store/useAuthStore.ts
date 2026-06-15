import { create } from 'zustand';
import { Role } from '@/types/enums';

export interface AuthUser {
  id: string;
  name: string;
  roles: Role[];
}

const USERS: AuthUser[] = [
  { id: 'U001', name: '张三', roles: [Role.Maker] },
  { id: 'U002', name: '李四', roles: [Role.Checker] },
  { id: 'U003', name: '王五', roles: [Role.Maker, Role.Checker] },
  { id: 'U004', name: '赵六', roles: [Role.Admin] },
];

interface AuthStore {
  user: AuthUser;
  userOptions: AuthUser[];
  setUser: (id: string) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: USERS[2], // 默认 U003 (maker + checker)
  userOptions: USERS,
  setUser: (id) => set({ user: USERS.find(u => u.id === id)! }),
}));

export default useAuthStore;
