import type { PropsWithChildren } from 'react';
import { DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import type { FormItemProps } from 'antd';
import { FormItem as FormilyFormItem, PreviewText } from '@formily/antd-v5';
import type { IFormItemProps } from '@formily/antd-v5';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  BUSINESS_TYPE_LABELS,
  BusinessType,
  MESSAGE_DIRECTION_LABELS,
  MessageDirection,
  TRANSMISSION_STATUS_LABELS,
  TransmissionStatus,
} from '@/types/enums';

type MessageFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type MessageTimeRange = [string, string] | null;

const DATE_FORMAT = 'YYYY-MM-DD';
const directionOptions = enumOptions(MessageDirection, MESSAGE_DIRECTION_LABELS);
const transmissionStatusOptions = enumOptions(TransmissionStatus, TRANSMISSION_STATUS_LABELS);
const businessTypeOptions = enumOptions(BusinessType, BUSINESS_TYPE_LABELS);

/** Formily 详情字段装饰器：空值只在展示层转换为 --，不污染表单数据。 */
export const MessageFormItem = ({ children, ...props }: PropsWithChildren<IFormItemProps>) => (
  <PreviewText.Placeholder value='--'>
    <FormilyFormItem {...props}>{children}</FormilyFormItem>
  </PreviewText.Placeholder>
);

/** 报文标识号 */
export const MessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgId' label='Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter message ID' />
  </Form.Item>
);

/** 交易流水号 */
export const MessageBusinessNoFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgBusinessNo' label='Transaction No.' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter transaction number' />
  </Form.Item>
);

/** 报文类型编码 */
export const MessageTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgType' label='Message Type' normalize={trimWhitespace}>
    <Input allowClear placeholder='e.g. pacs.008.001.01' />
  </Form.Item>
);

/** 收发标志 */
export const MessageDirectionFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgDirection' label='Direction'>
    <Select allowClear placeholder='All' options={directionOptions} />
  </Form.Item>
);

/** 报文状态 */
export const TransmissionStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='transmissionStatus' label='Message Status'>
    <Select allowClear placeholder='All' options={transmissionStatusOptions} />
  </Form.Item>
);

/** 收发报文日期 */
export const MessageTimeRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='messageTimeRange'
    label='Received/Sent Date'
    getValueFromEvent={getIsoDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker className='w-full' format={DATE_FORMAT} />
  </Form.Item>
);

/** 业务类型 */
export const BusinessTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='businessType' label='Business Type'>
    <Select allowClear placeholder='All' options={businessTypeOptions} />
  </Form.Item>
);

/** 收发报通道 */
export const MessageChannelFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgChannel' label='Channel' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter channel' />
  </Form.Item>
);

/** 主报文编号 */
export const MainMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='mainMsgId' label='Main Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter main message ID' />
  </Form.Item>
);

/** 关联流水号 */
export const RelatedMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRelatedId' label='Related Transaction No.' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter related transaction number' />
  </Form.Item>
);

/** 端到端流水号 */
export const EndToEndMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgEndId' label='End-to-End ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter end-to-end ID' />
  </Form.Item>
);

/** UETR 唯一标识号 */
export const MessageUetrFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgUetr' label='UETR' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter UETR' />
  </Form.Item>
);

/** 发报机构 */
export const MessageSendInstFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgSendInst' label='Sending Institution' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter institution code' />
  </Form.Item>
);

/** 收报机构 */
export const MessageRecvInstFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRecvInst' label='Receiving Institution' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter institution code' />
  </Form.Item>
);

/** 金额区间 */
export const AmountRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} label='Amount'>
    <Space.Compact block>
      <Form.Item name='amountFrom' noStyle>
        <InputNumber className='min-w-0 flex-1' controls={false} placeholder='Minimum' />
      </Form.Item>
      <span className='flex shrink-0 items-center px-2'>-</span>
      <Form.Item name='amountTo' noStyle>
        <InputNumber className='min-w-0 flex-1' controls={false} placeholder='Maximum' />
      </Form.Item>
    </Space.Compact>
  </Form.Item>
);

/** 清分目标部门 */
export const ClearingTargetDepartmentFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='clearingTargetDepartment'
    label='Clearing Target Department'
    normalize={trimWhitespace}
  >
    <Input allowClear placeholder='Enter department' />
  </Form.Item>
);

const trimWhitespace = (value?: string) => value?.trim() ?? '';

/** 将日期组件选中的 Dayjs 区间转换为覆盖整日的 ISO 时间区间，供表单查询使用。 */
const getIsoDateRange = (dates: [Dayjs, Dayjs] | null): MessageTimeRange =>
  dates ? [dates[0].startOf('day').toISOString(), dates[1].endOf('day').toISOString()] : null;

/** 将表单中的 ISO 时间区间转换为日期组件可识别的 Dayjs 区间，用于回显。 */
const getDateRangeValueProps = (value?: MessageTimeRange) => ({
  value: value ? [dayjs(value[0]), dayjs(value[1])] : null,
});

function enumOptions<T extends string>(values: Record<string, T>, labels: Record<T, string>) {
  return Object.values(values).map((value) => ({ value, label: labels[value] ?? value }));
}
