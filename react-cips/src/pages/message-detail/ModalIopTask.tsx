import { createRef } from 'react';
import { Form } from 'antd';
import type { FormInstance, ModalFuncProps } from 'antd';
import type { IopDistributeCreationCreateRequest } from '@/api/iop';
import {
  IopMsgOwner,
  IopTargetSysId,
  IopTaskContent,
  IopTaskMsgRelatedId,
  IopTaskMsgRecvCipsCode,
  IopTaskMsgType,
} from '@/components/IopPageCommon/formItem';
import type { IopInquiryReplyFormFields } from '@/components/IopPageCommon/inquiryReplyUtil';

/** 创建分发任务填写字段。 */
export type DistributeFields = Pick<
  IopDistributeCreationCreateRequest,
  'targetSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

interface ModalIopTaskApi {
  /** 在当前 Ant Design App 主题上下文中打开确认弹窗。 */
  confirm: (config: ModalFuncProps) => unknown;
}

/** 打开创建分发任务弹窗并收集分发信息。 */
export const openModalDistribute = (modal: ModalIopTaskApi): Promise<false | DistributeFields> => {
  return new Promise((resolve) => {
    const formRef = createRef<FormInstance<DistributeFields>>();

    modal.confirm({
      title: 'Create Distribution Task',
      content: (
        <Form ref={formRef} layout='vertical' initialValues={{ targetSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}>
          <IopTargetSysId />
          <IopMsgOwner />
        </Form>
      ),
      okText: 'Create',
      onOk: async () => {
        const fields = await formRef.current?.validateFields();
        if (!fields) return Promise.reject();
        resolve(fields);
      },
      onCancel: () => resolve(false),
    });
  });
};

/** 打开创建查询查复任务弹窗并收集业务信息。 */
export const openModalInquiryReply = (modal: ModalIopTaskApi): Promise<false | IopInquiryReplyFormFields> => {
  // 根据单行字段布局计算 Content 可用高度。
  const contentRows = Math.max(Math.floor((window.innerHeight * 0.7 - 210) / 22), 3);

  return new Promise((resolve) => {
    const formRef = createRef<FormInstance<IopInquiryReplyFormFields>>();

    modal.confirm({
      title: 'Create Inquiry Reply Task',
      width: '70vw',
      content: (
        <Form ref={formRef} layout='vertical' initialValues={{ msgType: undefined, content: '' }}>
          <div className='mb-3 flex gap-3'>
            <IopTaskMsgType className='mb-0 min-w-0 flex-1' />
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
        resolve(fields);
      },
      onCancel: () => resolve(false),
    });
  });
};
