import type { UserIdentity } from '@/types';
import { get } from './request';

export interface CurrentUserBody {
  user: UserIdentity;
  roles: string[];
  pageRoles: Record<string, string[]>;
}

export const getCurrentUserApi = (token: string) =>
  get<CurrentUserBody>('/api/example/v1/users/current', {
    params: { token },
  });
