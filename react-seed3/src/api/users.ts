import type { UserIdentity } from '@/types';
import type { Role } from '@/types/enums';
import { get } from './request';

export interface GetOt4UserBody {
  user: UserIdentity;
  roles: string[];
  pageRoles: {
    CiesTasks: Role[];
  };
}

export const getOt4UserApi = (otfUserToken: string) =>
  get<GetOt4UserBody>('/api/cies/v1/ot4/getOt4User', {
    params: { otfUserToken },
  });
