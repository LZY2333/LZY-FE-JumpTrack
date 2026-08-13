import type { UserIdentity } from '@/types';
import { get } from './request';

export interface GetOt4UserBody {
  user: UserIdentity;
  roles: string[];
  pageRoles: Record<string, string[]>;
}

export const getOt4UserApi = (otfUserToken: string) =>
  get<GetOt4UserBody>('/api/cies/v1/ot4/getOt4User', {
    params: { otfUserToken },
  });
