import { createRef } from 'react';
import { Form } from 'antd';
import type { FormInstance, ModalFuncProps } from 'antd';
import type { IopDistributeCreationCreateRequest, IopInquiryReplyBusData } from '@/api/iop';
import { IopMsgOwner, IopTargeSysId, IopTaskContent, IopTaskMsgType } from '@/components/IopPageCommon/formItem';

/** 创建分发任务填写字段。 */
export type DistributeFields = Pick<
  IopDistributeCreationCreateRequest,
  'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
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
        <Form ref={formRef} layout='vertical' initialValues={{ targeSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}>
          <IopTargeSysId />
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
export const openModalInquiryReply = (modal: ModalIopTaskApi): Promise<false | IopInquiryReplyBusData> => {
  // 根据弹窗的视口高度计算文本域行数，使 Content 占满 Message Type 下方的可用空间。
  const contentRows = Math.max(Math.floor((window.innerHeight * 0.7 - 190) / 22), 3);

  return new Promise((resolve) => {
    const formRef = createRef<FormInstance<IopInquiryReplyBusData>>();

    modal.confirm({
      title: 'Create Inquiry Reply Task',
      width: '70vw',
      styles: { content: { height: '70vh' } },
      content: (
        <Form ref={formRef} layout='vertical' initialValues={{ msgType: undefined, content: '' }}>
          <IopTaskMsgType className='mb-3' />
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
