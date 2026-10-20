import type { PartyLoginRequest, PartyLoginStatusResponse } from '@/api/partyLogin';
import type { ApiResult } from '@/api/request';
import { PartyLoginStatusEnum, ResCode } from '@/types/enums';

/** 登录登出 Mock 请求 */
interface PartyLoginMockRequestOption {
  /** vite-plugin-mock 解析后的请求体 */
  body?: unknown;
}

let currentPartyLoginStatus: PartyLoginStatusResponse = {
  chsName: '',
  endName: '',
  bankBic: 'WUBAHKHHXXX',
  loginSts: PartyLoginStatusEnum.LoggedIn,
  partyId: 'WUBAHKHHXXX',
};

/** 查询开发环境当前参与行登录状态 */
const handlePartyLoginStatus = (): ApiResult<PartyLoginStatusResponse> => ({
  returnCode: ResCode.Success,
  body: { ...currentPartyLoginStatus },
});

/** 提交开发环境参与行登录登出状态 */
const handlePartyLoginSubmit = ({ body: request }: PartyLoginMockRequestOption): ApiResult<undefined> => {
  if (!isPartyLoginRequestValid(request)) {
    return { returnCode: 'ERR0400', errorMsg: 'A valid login status is required.' };
  }

  currentPartyLoginStatus = { ...currentPartyLoginStatus, loginSts: request.loginSts };
  return { returnCode: ResCode.Success };
};

export default [
  { url: '/pssst/manager/auth/loginStatus', method: 'get', response: handlePartyLoginStatus },
  { url: '/pssst/manager/auth/loginTypeRequest', method: 'post', response: handlePartyLoginSubmit },
];

/** 校验参与行登录登出的目标状态 */
const isPartyLoginRequestValid = (request: unknown): request is PartyLoginRequest => {
  if (request === null) return false;
  if (typeof request !== 'object') return false;
  if (!('loginSts' in request)) return false;
  return request.loginSts === PartyLoginStatusEnum.LoggedIn || request.loginSts === PartyLoginStatusEnum.LoggedOut;
};
