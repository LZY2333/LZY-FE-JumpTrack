import type { PropsWithChildren } from 'react';
import { DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import type { FormItemProps } from 'antd';
import { FormItem as FormilyFormItem, PreviewText } from '@formily/antd-v5';
import type { IFormItemProps } from '@formily/antd-v5';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { MESSAGE_DIRECTION_LABELS, MSG_RECV_STATUS_LABELS, MessageDirection, MsgRecvStatus } from '@/types/enums';

type MessageFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type MessageTimeRange = [string, string] | null;

/** 将字符串枚举转换为 Ant Design 下拉选项。 */
const enumOptions = <Value extends string>(values: Record<string, Value>, labels: Record<Value, string>) =>
  Object.values(values).map((value) => ({ value, label: labels[value] ?? value }));

const DATE_FORMAT = 'YYYY-MM-DD';
const directionOptions = enumOptions(MessageDirection, MESSAGE_DIRECTION_LABELS);
const msgRecvStatusOptions = enumOptions(MsgRecvStatus, MSG_RECV_STATUS_LABELS);
const stpIndicatorOptions = [
  { value: 'Y', label: 'Y - STP' },
  { value: 'N', label: 'N - Non-STP' },
];

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
  <Form.Item {...props} name='msgBusinessNo' label='Business No.' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter business number' />
  </Form.Item>
);

/** 报文类型编码 */
export const MessageTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgType' label='Message Type' normalize={trimWhitespace}>
    <Input allowClear placeholder='e.g. pacs.008.001.01' />
  </Form.Item>
);

/** 报文业务类型编码 */
export const MessageBusTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgBusType' label='Message Business Type' normalize={trimWhitespace}>
    <Input allowClear placeholder='e.g. pacs.008' />
  </Form.Item>
);

/** 收发标志 */
export const MessageDirectionFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgDirection' label='Direction'>
    <Select allowClear placeholder='All' options={directionOptions} />
  </Form.Item>
);

/** 收报状态 */
export const MessageRecvStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRecvStatus' label='Received Status'>
    <Select allowClear placeholder='All' options={msgRecvStatusOptions} />
  </Form.Item>
);

/** 发报状态；状态码待后端代码表确定，当前按原值查询。 */
export const MessageSendStatusFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgSendStatus' label='Sent Status' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter sent status' />
  </Form.Item>
);

/** 收报日期 */
export const MessageRecvDateRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='msgRecvDateRange'
    label='Received Date'
    getValueFromEvent={getIsoDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker className='w-full' format={DATE_FORMAT} />
  </Form.Item>
);

/** 发报日期 */
export const MessageSendDateRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='msgSendDateRange'
    label='Sent Date'
    getValueFromEvent={getIsoDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker className='w-full' format={DATE_FORMAT} />
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
  <Form.Item {...props} name='msgRelatedId' label='Related Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter related message ID' />
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

/** REF_NO：显示名沿用 OurReference */
export const RefNoFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='refNo' label='OurReference' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter reference number' />
  </Form.Item>
);

/** TRAN_ID：显示名沿用 refTxn20 */
export const TranIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='tranId' label='refTxn20' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter transaction ID' />
  </Form.Item>
);

/** 支付类报文汇付金额区间 */
export const RemitAmountRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} label='Remittance Amount'>
    <Space.Compact block>
      <Form.Item name='remitAmountFrom' noStyle>
        <InputNumber className='min-w-0 flex-1' controls={false} placeholder='Minimum' />
      </Form.Item>
      <span className='flex shrink-0 items-center px-2'>-</span>
      <Form.Item name='remitAmountTo' noStyle>
        <InputNumber className='min-w-0 flex-1' controls={false} placeholder='Maximum' />
      </Form.Item>
    </Space.Compact>
  </Form.Item>
);

/** MSG_OWNER_DEPT：显示名沿用 Clearing Target Department */
export const MsgOwnerDeptFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgOwnerDept' label='Clearing Target Department' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter department' />
  </Form.Item>
);

/** 报文归属组 */
export const MsgOwnerGroupFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgOwnerGroup' label='Message Owner Group' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter owner group' />
  </Form.Item>
);

/** 直通标记 */
export const StpIndFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='stpInd' label='STP Indicator'>
    <Select allowClear placeholder='All' options={stpIndicatorOptions} />
  </Form.Item>
);

/** 非直通原因编号 */
export const NonStpCodeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='nonStpCode' label='Non-STP Reason Code' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter reason code' />
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
