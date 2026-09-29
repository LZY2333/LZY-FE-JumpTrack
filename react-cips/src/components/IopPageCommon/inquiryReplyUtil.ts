import type { IopInquiryReplyBusData, IopInquiryReplyCreateRequest } from '@/api/iop';
import { IopInquiryReplyMsgType } from '@/types/enums';

/** 查询查复表单直接填写的字段。 */
export type IopInquiryReplyFormFields = Pick<
  IopInquiryReplyBusData,
  'msgType' | 'content' | 'msgRelatedId' | 'msgRecvCipsCode'
>;

/** 按报文类型构造查询查复创建和经办共用的送值字段。 */
export const buildInquiryReplyPayload = (
  fields: IopInquiryReplyFormFields,
  sourceMsgId: string,
  sourceMainMsgId?: string | null,
): Pick<IopInquiryReplyCreateRequest, 'msgId' | 'busData'> => {
  const isType309 = fields.msgType === IopInquiryReplyMsgType.Type309;

  return {
    msgId: isType309 ? '' : sourceMsgId,
    busData: {
      msgType: fields.msgType,
      content: fields.content.trim(),
      mainMsgId: fields.msgType === IopInquiryReplyMsgType.Type302 ? sourceMainMsgId ?? '' : '',
      ...(isType309 && {
        msgRecvCipsCode: fields.msgRecvCipsCode?.trim() ?? '',
        msgRelatedId: fields.msgRelatedId?.trim() ?? '',
      }),
    },
  };
};
