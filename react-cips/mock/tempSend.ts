import type { TempSendRequest } from '../src/api/tempSend';
import type { ApiResult } from '../src/api/request';
import { ResCode } from '../src/types/enums';

export default [
  {
    url: '/pssst/manager/api/v1/cips/template-send',
    method: 'post',
    response: ({ body }: { /** 模板请求 */ body: TempSendRequest }): ApiResult => ({
      returnCode: body.messageType && body.formValues ? ResCode.Success : 'INVALID_REQUEST',
      errorMsg: body.messageType && body.formValues ? undefined : 'Message type and form values are required',
    }),
  },
];
