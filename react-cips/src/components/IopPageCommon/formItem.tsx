import type { ComponentProps } from 'react';
import { Form, Input, Select, Space } from 'antd';
import type { FormItemProps } from 'antd';

/** IOP 表单字段公共属性，字段名称和业务规则由组件维护。 */
type IopFormItemProps = Omit<FormItemProps, 'children' | 'label' | 'name'>;

interface IopTaskContentProps extends IopFormItemProps {
  /** 内容文本框自适应高度配置。 */
  textAreaAutoSize?: ComponentProps<typeof Input.TextArea>['autoSize'];
}

const inquiryReplyMsgTypeOptions = ['301', '302', '309'].map((value) => ({ value, label: value }));

/**==================== 创建分发 ====================**/

/** 目标系统编号 */
export const IopTargeSysId = (props: IopFormItemProps) => {
  const form = Form.useFormInstance();

  return (
    <Form.Item
      {...props}
      className='mb-0'
      name='targeSysId'
      label='Target System ID'
      normalize={trimWhitespace}
      dependencies={['msgOwnerDept', 'msgOwnerGroup']}
      rules={[
        {
          validator: (_, targeSysId?: string) => {
            const { msgOwnerDept, msgOwnerGroup } = form.getFieldsValue();
            if (targeSysId?.trim() || msgOwnerDept?.trim() || msgOwnerGroup?.trim()) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Enter at least one of Target System ID, Department, or Group'));
          },
        },
      ]}
    >
      <Input className='w-40' allowClear maxLength={10} placeholder='Enter target system ID' />
    </Form.Item>
  );
};

/** 报文归属 */
export const IopMsgOwner = (props: IopFormItemProps) => (
  <Form.Item {...props} className='mb-0' label='Owner By'>
    <Space.Compact block>
      <Form.Item name='msgOwnerDept' noStyle normalize={trimWhitespace}>
        <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Department' />
      </Form.Item>
      <Form.Item name='msgOwnerGroup' noStyle normalize={trimWhitespace}>
        <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Group' />
      </Form.Item>
    </Space.Compact>
  </Form.Item>
);

const trimWhitespace = (value?: string) => value?.trim() ?? '';

/**==================== 查询查复 ====================**/
/** 报文类型 */
export const IopTaskMsgType = (props: IopFormItemProps) => (
  <Form.Item
    {...props}
    name='msgType'
    rules={[{ required: true, message: 'Please select message type' }]}
  >
    <Select className='w-full' allowClear placeholder='Select message type' options={inquiryReplyMsgTypeOptions} />
  </Form.Item>
);

/** 查询查复内容 */
export const IopTaskContent = ({
  textAreaAutoSize = { minRows: 3, maxRows: 6 },
  ...formItemProps
}: IopTaskContentProps) => (
  <Form.Item
    {...formItemProps}
    name='content'
    rules={[{ required: true, whitespace: true, message: 'Please enter content' }]}
  >
    <Input.TextArea className='w-full' allowClear autoSize={textAreaAutoSize} placeholder='Enter content' />
  </Form.Item>
);
