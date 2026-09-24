import type { UserIdentity } from '@/types';
import type { RequestConfig } from './request';
import { get } from './request';

/** 当前用户查询 URL。 */
export const API_CURRENT_USER = '/pssst/manager/sdk/ot4/get-ot4-user';
/** 根据认证 token 查询当前用户。 */
export const getCurrentUserApi = (token: string, config?: RequestConfig) =>
  get<CurrentUserBody>(API_CURRENT_USER, {
    ...config,
    params: { ...config?.params, token },
  });

export interface CurrentUserBody {
  /** 当前用户；未绑定 T24 账号时可能缺省。 */
  user?: UserIdentity;
  /** 当前用户角色。 */
  roles?: string[];
  /** 当前用户页面权限。 */
  pageRoles?: Record<string, string[]>;
}
