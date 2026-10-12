import { createRef } from 'react';
import { Form } from 'antd';
import type { App, FormInstance } from 'antd';
import { postIRApprove, postIRCreate } from '@/api/iop';
import type { IopInquiryReplyCreateRequest } from '@/api/iop';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import type { MessageRecord } from '@/types/message';
import { IopInquiryReplyMsgType } from '@/types/enums';
import {
  IopTaskContent,
  IopTaskMsgRelatedId,
  IopTaskMsgRecvCipsCode,
  IopTaskMsgType,
} from '@/components/IopPageCommon/formItem';
import { buildInquiryReplyPayload } from '@/components/IopPageCommon/inquiryReplyUtil';
import type { IopInquiryReplyFormFields } from '@/components/IopPageCommon/inquiryReplyUtil';

/** 查询查复弹窗使用的 Ant Design 上下文能力 */
type ModalInquiryReplyApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm' | 'info'>;

/** 查询查复弹窗的来源报文信息 */
interface ModalInquiryReplySource {
  /** 来源报文类型与收发方向，用于校验查询查复报文类型 */
  sourceMessage: Pick<MessageRecord, 'msgType' | 'msgDirection'> | null;
}

/** 明细页创建查询查复任务的弹窗上下文 */
interface ModalInquiryReplyCreateOptions
  extends ModalInquiryReplySource,
    Omit<IopInquiryReplyCreateRequest, 'busData'> {
  /** 来源报文主报文编号，用于校验 302 查复 */
  sourceMainMsgId?: string | null;
  /** 创建任务时尚无 IOP 工作流上下文 */
  task?: never;
}

/** IOP 经办查询查复任务的弹窗上下文 */
interface ModalInquiryReplyMakerOptions extends ModalInquiryReplySource {
  /** 当前 IOP 任务及操作用户信息 */
  task: IopTaskData;
}

/** 查询查复弹窗的创建或经办上下文 */
type ModalInquiryReplyOptions = ModalInquiryReplyCreateOptions | ModalInquiryReplyMakerOptions;

/** 打开查询查复弹窗，校验或提交失败时保留弹窗供用户修改和重试 */
export const openModalInquiryReply = async (
  modal: ModalInquiryReplyApi,
  options: ModalInquiryReplyOptions,
): Promise<boolean> => {
  const { task, sourceMessage } = options;
  const { msgId, userId, orgId, sourceMainMsgId } = task
    ? {
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        sourceMainMsgId: task.mainMsgId,
      }
    : options;

  // 根据单行字段布局计算 Content 可用高度
  const contentRows = Math.max(Math.floor((window.innerHeight * 0.7 - 210) / 22), 3);
  const formRef = createRef<FormInstance<IopInquiryReplyFormFields>>();

  return modal.confirm({
    title: task ? 'Inquiry Reply' : 'Create Inquiry Reply Task',
    width: '70vw',
    content: (
      <Form ref={formRef} layout='vertical'>
        <div className='mb-3 flex gap-3'>
          <IopTaskMsgType className='mb-0 min-w-0 flex-1' sourceMessage={sourceMessage} />
          <IopTaskMsgRecvCipsCode className='mb-0 min-w-0 flex-1' />
          <IopTaskMsgRelatedId className='mb-0 min-w-0 flex-1' />
        </div>
        <IopTaskContent className='mb-0' textAreaAutoSize={{ minRows: contentRows, maxRows: contentRows }} />
      </Form>
    ),
    okText: task ? 'Submit' : 'Create',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();
      if (fields.msgType === IopInquiryReplyMsgType.Type302 && !sourceMainMsgId) {
        formRef.current?.setFields([
          { name: 'msgType', errors: ['Main message ID is unavailable for the inquiry reply'] },
        ]);
        return Promise.reject();
      }

      // 查询查复业务字段
      const request = {
        ...buildInquiryReplyPayload({
          fields,
          sourceMsgId: msgId,
          sourceMainMsgId,
          forceMsgId: !!task,
        }),
        userId,
        orgId,
      };
      const stopGlobalLoading = startGlobalLoading();
      try {
        const response = task
          ? await postIRApprove({
              ...request,
              taskId: task.taskId,
              taskNode: task.taskNode,
              iopWkiId: task.iopWkiId,
              iopNodNam: task.iopNodNam,
              iopWfTaskId: task.iopWfTaskId,
              next: true,
            })
          : await postIRCreate(request);
        response?.msgId &&
          modal.info({
            width: 360,
            icon: null,
            content: `TranSaction Ref No: ${response.msgId}`,
          });
      } finally {
        stopGlobalLoading();
      }
    },
  });
};
