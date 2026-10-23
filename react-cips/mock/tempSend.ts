import type { TempSendGeneratedMessage, TempSendRequest } from '../src/api/tempSend';
import type { ApiResult } from '../src/api/request';
import { ResCode } from '../src/types/enums';

export default [
  {
    url: '/pssst/manager/api/v1/cips/template-generate',
    method: 'post',
    response: ({ body }: { /** 模板请求 */ body: TempSendRequest }): ApiResult<TempSendGeneratedMessage> => {
      if (!body.messageType || !body.formValues) {
        return { returnCode: 'INVALID_REQUEST', errorMsg: 'Message type and form values are required' };
      }
      const msgId = `MOCK${Date.now()}`;
      return {
        returnCode: ResCode.Success,
        body: {
          msgId,
          refId: `REF${Date.now()}`,
          messageType: body.messageType,
          msgContent: [
            '<Document>',
            `  <MsgId>${msgId}</MsgId>`,
            `  <MsgType>${escapeXml(body.messageType)}</MsgType>`,
            '  <FormValues>',
            ...Object.entries(body.formValues).map(
              ([key, value]) => `    <Field name="${escapeXml(key)}">${escapeXml(String(value))}</Field>`,
            ),
            '  </FormValues>',
            '</Document>',
          ].join('\n'),
        },
      };
    },
  },
  {
    url: '/pssst/manager/api/v1/cips/template-send',
    method: 'post',
    response: ({ body }: { /** 模板请求 */ body: TempSendRequest }): ApiResult => ({
      returnCode: body.messageType && body.formValues ? ResCode.Success : 'INVALID_REQUEST',
      errorMsg: body.messageType && body.formValues ? undefined : 'Message type and form values are required',
    }),
  },
];

/** 转义示例报文字段 */
const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
