import type { PropsWithChildren } from 'react';
import { DatePicker, Form, Input, Select } from 'antd';
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

export const MessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgId' label='报文标识号' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入报文标识号' />
  </Form.Item>
);

export const MessageBusinessNoFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgBusinessNo' label='交易流水号' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入交易流水号' />
  </Form.Item>
);

export const MessageTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgType' label='报文类型编码' normalize={trimWhitespace}>
    <Input allowClear placeholder='例如 pacs.008.001.01' />
  </Form.Item>
);

export const MessageDirectionFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgDirection' label='收发标志' rules={[{ required: true, message: '请选择收发标志' }]}>
    <Select placeholder='请选择收发标志' options={directionOptions} />
  </Form.Item>
);

export const TransmissionStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='transmissionStatus' label='报文状态'>
    <Select allowClear placeholder='全部' options={transmissionStatusOptions} />
  </Form.Item>
);

export const MessageTimeRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='messageTimeRange'
    label='收/发报文日期'
    getValueFromEvent={getIsoDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker className='w-full' format={DATE_FORMAT} />
  </Form.Item>
);

export const BusinessTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='businessType' label='业务类型'>
    <Select allowClear placeholder='全部' options={businessTypeOptions} />
  </Form.Item>
);

export const MessageChannelFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgChannel' label='收/发报通道' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入收/发报通道' />
  </Form.Item>
);

export const MainMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='mainMsgId' label='主报文编号' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入主报文编号' />
  </Form.Item>
);

export const RelatedMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRelatedId' label='关联流水号' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入关联流水号' />
  </Form.Item>
);

export const EndToEndMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgEndId' label='端到端流水号' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入端到端流水号' />
  </Form.Item>
);

export const MessageUetrFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgUetr' label='UETR' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入 UETR' />
  </Form.Item>
);

export const MessageSendInstFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgSendInst' label='发报机构' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入发报机构编号' />
  </Form.Item>
);

export const MessageRecvInstFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRecvInst' label='收报机构' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入收报机构编号' />
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
