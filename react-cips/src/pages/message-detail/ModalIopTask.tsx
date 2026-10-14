import { createRef } from 'react';
import { Form } from 'antd';
import type { App, FormInstance } from 'antd';
import { postDCCreate } from '@/api/iop';
import type { IopDistributeCreationCreateRequest } from '@/api/iop';
import { IopTargetSysId } from '@/components/IopPageCommon/formItem';
import { MessageOwnerBy } from '@/components/FormItem/message';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 创建分发任务填写字段。 */
export type DistributeFields = Pick<
  IopDistributeCreationCreateRequest,
  'targetSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

/** 创建任务弹窗使用的 Ant Design 上下文能力 */
type ModalIopTaskApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm' | 'info'>;

/** 创建任务所需的页面上下文 */
interface IopTaskRequestContext {
  /** 报文编号 */
  msgId: string;
  /** 当前用户 ID */
  userId: string;
  /** 当前用户机构号 */
  orgId: string;
}

/** 打开创建分发任务弹窗，创建失败时保留弹窗供用户重试 */
export const openModalDistribute = async (modal: ModalIopTaskApi, context: IopTaskRequestContext): Promise<boolean> => {
  const formRef = createRef<FormInstance<DistributeFields>>();

  return modal.confirm({
    title: 'Create Distribution Task',
    content: (
      <Form
        ref={formRef}
        layout='horizontal'
        labelAlign='left'
        labelCol={{ flex: '120px' }}
        initialValues={{ targetSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
      >
        <IopTargetSysId className='mb-2' />
        <MessageOwnerBy />
      </Form>
    ),
    okText: 'Create',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();

      const stopGlobalLoading = startGlobalLoading();
      try {
        const response = await postDCCreate({
          msgId: context.msgId,
          userId: context.userId,
          orgId: context.orgId,
          targetSysId: normalizeOptionalText(fields.targetSysId),
          msgOwnerDept: normalizeOptionalText(fields.msgOwnerDept),
          msgOwnerGroup: normalizeOptionalText(fields.msgOwnerGroup),
        });
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

/** 将可选文本统一转换为接口空值 */
const normalizeOptionalText = (value?: string) => value?.trim() || undefined;
