import type { PropsWithChildren } from 'react';
import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import { FormItem as FormilyFormItem, PreviewText } from '@formily/antd-v5';
import type { IFormItemProps } from '@formily/antd-v5';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  BUSINESS_STATUS_LABELS,
  BUSINESS_TYPE_LABELS,
  BusinessStatus,
  BusinessType,
  MESSAGE_DIRECTION_LABELS,
  MessageDirection,
  TRANSMISSION_STATUS_LABELS,
  TransmissionStatus,
} from '@/types/enums';

type MessageFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type MessageTimeRange = [string, string] | null;

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const directionOptions = enumOptions(MessageDirection, MESSAGE_DIRECTION_LABELS);
const transmissionStatusOptions = enumOptions(TransmissionStatus, TRANSMISSION_STATUS_LABELS);
const businessStatusOptions = enumOptions(BusinessStatus, BUSINESS_STATUS_LABELS);
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
  <Form.Item {...props} name='msgDirection' label='收发标志'>
    <Select allowClear placeholder='全部' options={directionOptions} />
  </Form.Item>
);

export const TransmissionStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='transmissionStatus' label='收发状态'>
    <Select allowClear placeholder='全部' options={transmissionStatusOptions} />
  </Form.Item>
);

export const BusinessStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='businessStatus' label='业务状态'>
    <Select allowClear placeholder='全部' options={businessStatusOptions} />
  </Form.Item>
);

export const MessageTimeRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='messageTimeRange'
    label='统一报文时间'
    getValueFromEvent={getIsoDateTimeRange}
    getValueProps={getDateTimeRangeValueProps}
  >
    <DatePicker.RangePicker className='w-full' showTime format={DATE_TIME_FORMAT} />
  </Form.Item>
);

export const BusinessTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='businessType' label='业务类型'>
    <Select allowClear placeholder='全部' options={businessTypeOptions} />
  </Form.Item>
);

export const MessageChannelFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgChannel' label='收报渠道' normalize={trimWhitespace}>
    <Input allowClear placeholder='请输入收报渠道' />
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

// 查询协议使用 ISO 字符串，组件层负责在 Dayjs 与接口值之间双向转换。
const getIsoDateTimeRange = (dates: [Dayjs, Dayjs] | null): MessageTimeRange =>
  dates ? [dates[0].toISOString(), dates[1].toISOString()] : null;

const getDateTimeRangeValueProps = (value?: MessageTimeRange) => ({
  value: value ? [dayjs(value[0]), dayjs(value[1])] : null,
});

function enumOptions<T extends string>(values: Record<string, T>, labels: Record<T, string>) {
  return Object.values(values).map((value) => ({ value, label: labels[value] ?? value }));
}
