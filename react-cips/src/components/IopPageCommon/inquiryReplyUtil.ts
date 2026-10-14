import type { IopInquiryReplyBusData, IopInquiryReplyCreateRequest } from '@/api/iop';
import { IopInquiryReplyMsgType } from '@/types/enums';

/** 查询查复表单直接填写的字段 */
export type IopInquiryReplyFormFields = Pick<
  IopInquiryReplyBusData,
  'msgType' | 'content' | 'msgRelatedId' | 'msgRecvCipsCode'
>;

/** 查询查复请求字段构造参数 */
interface IopInquiryReplyPayloadParams {
  /** 查询查复表单字段 */
  fields: IopInquiryReplyFormFields;
  /** 原报文编号 */
  sourceMsgId: string;
  /** 主报文编号 */
  sourceMainMsgId?: string | null;
  /** 来源报文关联流水号，用于 302 查复 */
  sourceMsgRelatedId?: string | null;
  /** Maker 提交时传 true，确保 309 也传入原报文编号 */
  forceMsgId?: boolean;
}

/** 构建查询查复业务字段 */
export const buildInquiryReplyPayload = ({
  fields,
  sourceMsgId,
  sourceMainMsgId,
  sourceMsgRelatedId,
  forceMsgId = false,
}: IopInquiryReplyPayloadParams): Pick<IopInquiryReplyCreateRequest, 'msgId' | 'busData'> => {
  const busData: IopInquiryReplyBusData = {
    msgType: fields.msgType,
    content: fields.content.trim(),
    mainMsgId: '',
  };

  switch (fields.msgType) {
    case IopInquiryReplyMsgType.Type302:
      return {
        msgId: sourceMsgId,
        busData: {
          ...busData,
          mainMsgId: sourceMainMsgId ?? '',
          msgRelatedId: sourceMsgRelatedId ?? '',
        },
      };
    case IopInquiryReplyMsgType.Type309:
      return {
        // 309 创建任务时置空；Maker 提交时后端仍需原报文编号
        msgId: forceMsgId ? sourceMsgId : '',
        busData: {
          ...busData,
          msgRecvCipsCode: fields.msgRecvCipsCode?.trim() ?? '',
          msgRelatedId: fields.msgRelatedId?.trim() ?? '',
        },
      };
    default:
      return { msgId: sourceMsgId, busData };
  }
};
