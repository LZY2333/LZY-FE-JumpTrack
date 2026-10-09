import { createRef } from 'react';
import { Form } from 'antd';
import type { App, FormInstance } from 'antd';
import { postDCCreate, postIRCreate } from '@/api/iop';
import type { IopDistributeCreationCreateRequest } from '@/api/iop';
import {
  IopMsgOwner,
  IopTargetSysId,
  IopTaskContent,
  IopTaskMsgRelatedId,
  IopTaskMsgRecvCipsCode,
  IopTaskMsgType,
} from '@/components/IopPageCommon/formItem';
import { buildInquiryReplyPayload } from '@/components/IopPageCommon/inquiryReplyUtil';
import type { IopInquiryReplyFormFields } from '@/components/IopPageCommon/inquiryReplyUtil';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IopInquiryReplyMsgType } from '@/types/enums';
import type { MessageRecord } from '@/types/message';

/** 创建分发任务填写字段。 */
export type DistributeFields = Pick<
  IopDistributeCreationCreateRequest,
  'targetSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

/** 创建任务弹窗使用的 Ant Design 上下文能力 */
type ModalIopTaskApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm'>;

/** 创建任务所需的页面上下文 */
interface IopTaskRequestContext {
  /** 报文编号 */
  msgId: string;
  /** 当前用户 ID */
  userId: string;
  /** 当前用户机构号 */
  orgId: string;
}

/** 创建查询查复任务所需的源报文上下文 */
interface InquiryReplyRequestContext extends IopTaskRequestContext {
  /** 报文类型与收发方向，用于初始化查询查复表单 */
  sourceMessage: Pick<MessageRecord, 'msgType' | 'msgDirection'> | null;
  /** 源报文主报文编号 */
  sourceMainMsgId?: string | null;
}

/** 打开创建分发任务弹窗，创建失败时保留弹窗供用户重试 */
export const openModalDistribute = async (modal: ModalIopTaskApi, context: IopTaskRequestContext): Promise<boolean> => {
  const formRef = createRef<FormInstance<DistributeFields>>();

  return modal.confirm({
    title: 'Create Distribution Task',
    content: (
      <Form ref={formRef} layout='vertical' initialValues={{ targetSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}>
        <IopTargetSysId className='mb-2' />
        <IopMsgOwner />
      </Form>
    ),
    okText: 'Create',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();

      const stopGlobalLoading = startGlobalLoading();
      try {
        await postDCCreate({
          msgId: context.msgId,
          userId: context.userId,
          orgId: context.orgId,
          targetSysId: normalizeOptionalText(fields.targetSysId),
          msgOwnerDept: normalizeOptionalText(fields.msgOwnerDept),
          msgOwnerGroup: normalizeOptionalText(fields.msgOwnerGroup),
        });
      } finally {
        stopGlobalLoading();
      }
    },
  });
};

/** 打开创建查询查复任务弹窗，创建失败时保留弹窗供用户重试 */
export const openModalInquiryReply = async (
  modal: ModalIopTaskApi,
  context: InquiryReplyRequestContext,
): Promise<boolean> => {
  // 根据单行字段布局计算 Content 可用高度。
  const contentRows = Math.max(Math.floor((window.innerHeight * 0.7 - 210) / 22), 3);

  const formRef = createRef<FormInstance<IopInquiryReplyFormFields>>();

  return modal.confirm({
    title: 'Create Inquiry Reply Task',
    width: '70vw',
    content: (
      <Form ref={formRef} layout='vertical' initialValues={{ msgType: undefined, content: '' }}>
        <div className='mb-3 flex gap-3'>
          <IopTaskMsgType className='mb-0 min-w-0 flex-1' sourceMessage={context.sourceMessage} />
          <IopTaskMsgRecvCipsCode className='mb-0 min-w-0 flex-1' />
          <IopTaskMsgRelatedId className='mb-0 min-w-0 flex-1' />
        </div>
        <IopTaskContent className='mb-0' textAreaAutoSize={{ minRows: contentRows, maxRows: contentRows }} />
      </Form>
    ),
    okText: 'Create',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();
      if (fields.msgType === IopInquiryReplyMsgType.Type302 && !context.sourceMainMsgId) {
        formRef.current?.setFields([
          { name: 'msgType', errors: ['Main message ID is unavailable for the inquiry reply'] },
        ]);
        return Promise.reject();
      }

      const stopGlobalLoading = startGlobalLoading();
      try {
        await postIRCreate({
          ...buildInquiryReplyPayload({
            fields,
            sourceMsgId: context.msgId,
            sourceMainMsgId: context.sourceMainMsgId,
          }),
          userId: context.userId,
          orgId: context.orgId,
        });
      } finally {
        stopGlobalLoading();
      }
    },
  });
};

/** 将可选文本统一转换为接口空值 */
const normalizeOptionalText = (value?: string) => value?.trim() || undefined;
