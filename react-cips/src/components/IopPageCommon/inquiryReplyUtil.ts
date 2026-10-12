import type { IopInquiryReplyBusData, IopInquiryReplyCreateRequest } from '@/api/iop';
import { IopInquiryReplyMsgType } from '@/types/enums';

/** 查询查复表单直接填写的字段。 */
export type IopInquiryReplyFormFields = Pick<
  IopInquiryReplyBusData,
  'msgType' | 'content' | 'msgRelatedId' | 'msgRecvCipsCode'
>;

/** 查询查复请求字段构造参数。 */
interface BuildInquiryReplyPayloadParams {
  /** 查询查复表单字段。 */
  fields: IopInquiryReplyFormFields;
  /** 原报文编号。 */
  sourceMsgId: string;
  /** 主报文编号。 */
  sourceMainMsgId?: string | null;
  /** Maker 提交时传 true，确保 309 也传入原报文编号。 */
  forceMsgId?: boolean;
}

/** 构建查询查复业务字段 */
export const buildInquiryReplyPayload = ({
  fields,
  sourceMsgId,
  sourceMainMsgId,
  forceMsgId = false,
}: BuildInquiryReplyPayloadParams): Pick<IopInquiryReplyCreateRequest, 'msgId' | 'busData'> => {
  // 309 创建任务时将 msgId 置空；Maker 提交时后端仍需原报文编号进行查询。
  const isType309 = fields.msgType === IopInquiryReplyMsgType.Type309;

  return {
    msgId: isType309 && !forceMsgId ? '' : sourceMsgId,
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
