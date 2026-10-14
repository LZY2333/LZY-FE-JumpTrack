import type { ComponentProps } from 'react';
import { Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import { DictionaryOptionsEnum, IopInquiryReplyMsgType, MessageDirection } from '@/types/enums';
import type { MessageRecord } from '@/types/message';
import { useDictionaryOptions } from '@/store/useDictionaryStore';
import { getSelectValueProps } from '@/utils';

/** IOP 表单字段公共属性，字段名称和业务规则由组件维护。 */
type IopFormItemProps = Omit<FormItemProps, 'children' | 'label' | 'name'>;

interface IopTaskContentProps extends IopFormItemProps {
  /** 内容文本框自适应高度配置。 */
  textAreaAutoSize?: ComponentProps<typeof Input.TextArea>['autoSize'];
  /** 内容文本框只读时仍允许拖拽高度。 */
  textAreaReadOnly?: boolean;
}

interface IopTaskMsgTypeProps extends IopFormItemProps {
  /** 创建查询查复任务时的当前报文信息 */
  sourceMessage?: Pick<MessageRecord, 'msgType' | 'msgDirection'> | null;
}

const inquiryReplyMsgTypeOptions = [
  { value: IopInquiryReplyMsgType.Type301, label: `${IopInquiryReplyMsgType.Type301} 业务查询报文` },
  { value: IopInquiryReplyMsgType.Type302, label: `${IopInquiryReplyMsgType.Type302} 业务查复报文` },
  { value: IopInquiryReplyMsgType.Type309, label: `${IopInquiryReplyMsgType.Type309} 自由格式报文` },
];

/**==================== 创建分发 ====================**/

/** 目标系统编号 */
export const IopTargetSysId = (props: IopFormItemProps) => {
  const form = Form.useFormInstance();
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.SystemId);

  return (
    <Form.Item
      {...props}
      name='targetSysId'
      label='Target System ID'
      getValueProps={getSelectValueProps}
      dependencies={['msgOwnerDept', 'msgOwnerGroup']}
      rules={[
        {
          validator: (_, targetSysId?: string) => {
            const { msgOwnerDept, msgOwnerGroup } = form.getFieldsValue();
            if (targetSysId?.trim() || msgOwnerDept?.trim() || msgOwnerGroup?.trim()) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Enter at least one of Target System ID, Department, or Group'));
          },
        },
      ]}
    >
      <Select className='w-full' allowClear placeholder='Select target system ID' options={options} />
    </Form.Item>
  );
};

/**==================== 查询查复 ====================**/
/** 报文类型 */
export const IopTaskMsgType = ({ sourceMessage, ...props }: IopTaskMsgTypeProps) => (
  <Form.Item
    {...props}
    name='msgType'
    label='Message Type'
    getValueProps={getSelectValueProps}
    rules={[
      { required: true, message: 'Please select message type' },
      {
        validator: (_, msgType?: IopInquiryReplyMsgType) => {
          if (sourceMessage === undefined || !msgType) return Promise.resolve();
          if (
            msgType === IopInquiryReplyMsgType.Type301 &&
            !/^cips\.(111|112|114)(\.|$)/.test(sourceMessage?.msgType ?? '')
          ) {
            return Promise.reject(new Error('301 requires a cips.111, cips.112, or cips.114 message'));
          }
          if (
            msgType === IopInquiryReplyMsgType.Type302 &&
            (!/^cips\.301(\.|$)/.test(sourceMessage?.msgType ?? '') ||
              sourceMessage?.msgDirection !== MessageDirection.In)
          ) {
            return Promise.reject(new Error('302 requires a received cips.301 message'));
          }
          return Promise.resolve();
        },
      },
    ]}
  >
    <Select className='w-full' allowClear placeholder='Select message type' options={inquiryReplyMsgTypeOptions} />
  </Form.Item>
);

/** 收报方 CIPS 行号 */
export const IopTaskMsgRecvCipsCode = (props: IopFormItemProps) => {
  const form = Form.useFormInstance();
  const msgType = Form.useWatch('msgType', form);
  if (msgType !== IopInquiryReplyMsgType.Type309) return null;

  return (
    <Form.Item
      {...props}
      name='msgRecvCipsCode'
      label='Receiving CIPS Code'
      preserve={false}
      rules={[{ required: true, whitespace: true, message: 'Please enter receiving CIPS code' }]}
    >
      <Input allowClear placeholder='Enter receiving CIPS code' />
    </Form.Item>
  );
};

/** 关联流水号 */
export const IopTaskMsgRelatedId = (props: IopFormItemProps) => {
  const form = Form.useFormInstance();
  const msgType = Form.useWatch('msgType', form);
  if (msgType !== IopInquiryReplyMsgType.Type309) return null;

  return (
    <Form.Item {...props} name='msgRelatedId' label='Related Message ID' preserve={false}>
      <Input allowClear placeholder='Enter related message ID' />
    </Form.Item>
  );
};

/** 查询查复内容 */
export const IopTaskContent = ({ textAreaAutoSize, textAreaReadOnly, ...formItemProps }: IopTaskContentProps) => (
  <Form.Item
    {...formItemProps}
    name='content'
    rules={[{ required: true, whitespace: true, message: 'Please enter content' }]}
  >
    <Input.TextArea
      className='w-full'
      allowClear={!textAreaReadOnly}
      autoSize={textAreaAutoSize}
      rows={textAreaAutoSize ? undefined : 3}
      disabled={textAreaReadOnly === undefined ? undefined : false}
      readOnly={textAreaReadOnly}
      placeholder='Enter content'
    />
  </Form.Item>
);
