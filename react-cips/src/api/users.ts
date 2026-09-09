import type { UserIdentity } from '@/types';
import { get } from './request';

/** 当前用户查询 URL。 */
export const API_CURRENT_USER = '/api/example/v1/users/current';
export const getCurrentUserApi = (token: string) =>
  get<CurrentUserBody>(API_CURRENT_USER, {
    params: { token },
  });

export interface CurrentUserBody {
  user: UserIdentity;
  roles: string[];
  pageRoles: Record<string, string[]>;
}
