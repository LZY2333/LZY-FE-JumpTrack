import type { PartyLoginStatusEnum } from '@/types/enums';
import type { PartyRecord } from './party';
import { get, post } from './request';

/** 当前参与行登录状态 */
export type PartyLoginStatusResponse = Pick<PartyRecord, 'chsName' | 'endName' | 'bankBic' | 'loginSts' | 'partyId'>;

/** 参与行登录登出请求 */
export interface PartyLoginRequest {
  /** 目标登录状态 */
  loginSts: PartyLoginStatusEnum;
}

/** 查询当前参与行登录状态 */
export const getPartyLoginStatus = () => get<PartyLoginStatusResponse>('/pssst/manager/auth/loginStatus');

/** 提交当前参与行登录登出状态 */
export const submitPartyLogin = (request: PartyLoginRequest) =>
  post<undefined>('/pssst/manager/auth/loginTypeRequest', request);
