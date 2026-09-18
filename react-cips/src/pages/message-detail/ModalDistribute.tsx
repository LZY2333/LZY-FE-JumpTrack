import { Form, Input, Modal, Space } from 'antd';
import type { IopDistributeCreationCreateRequest } from '@/api/iop/iop-distribute-creation';

/** 创建分发任务弹窗字段。 */
export type DistributionCreationFields = Pick<
  IopDistributeCreationCreateRequest,
  'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

interface ModalDistributionCreationContentProps {
  /** 更新创建分发任务字段。 */
  onChange: (field: keyof DistributionCreationFields, value: string) => void;
}

/** 打开创建分发任务弹窗。 */
export const openModalDistribute = (): Promise<false | DistributionCreationFields> => {
  return new Promise((resolve) => {
    const fields: DistributionCreationFields = {
      targeSysId: '',
      msgOwnerDept: '',
      msgOwnerGroup: '',
    };

    Modal.confirm({
      title: 'Create Distribution Task',
      content: (
        <ModalDistributionCreationContent
          onChange={(field, value) => {
            fields[field] = value;
          }}
        />
      ),
      okText: 'Create',
      onOk: () => resolve(normalizeDistributionCreationFields(fields)),
      onCancel: () => resolve(false),
    });
  });
};

/** 创建分发任务弹窗表单。 */
const ModalDistributionCreationContent = ({ onChange }: ModalDistributionCreationContentProps) => (
  <Form className='mt-4' layout='vertical'>
    <Form.Item label='Target System ID' className='mb-3'>
      <Input
        maxLength={10}
        placeholder='Enter target system ID'
        onChange={(event) => onChange('targeSysId', event.target.value)}
      />
    </Form.Item>
    <Form.Item label='Owner By' className='mb-0'>
      <Space.Compact block>
        <Input
          allowClear
          maxLength={10}
          placeholder='Department'
          onChange={(event) => onChange('msgOwnerDept', event.target.value)}
        />
        <Input
          allowClear
          maxLength={10}
          placeholder='Group'
          onChange={(event) => onChange('msgOwnerGroup', event.target.value)}
        />
      </Space.Compact>
    </Form.Item>
  </Form>
);

/** 清理创建分发任务弹窗字段空白。 */
const normalizeDistributionCreationFields = (fields: DistributionCreationFields): DistributionCreationFields => ({
  targeSysId: fields.targeSysId?.trim() || undefined,
  msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
  msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
});
