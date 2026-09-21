import { useEffect, useRef } from 'react';
import { DatePicker, Form, Input, InputNumber, Select, Space, Tooltip } from 'antd';
import type { FormItemProps } from 'antd';
import type { FeedbackIcons } from 'antd/es/form/FormItem';
import { CloseCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { isMessageDateDisabled, messageDatePresets } from './messageDateUtil';
import {
  MESSAGE_DIRECTION_LABELS,
  MESSAGE_BUSINESS_TYPE_LABELS,
  MSG_RECV_STATUS_LABELS,
  MSG_SEND_STATUS_LABELS,
  MessageDirection,
  MessageBusinessType,
  MsgRecvStatus,
  MsgSendStatus,
  MessageChannel,
} from '@/types/enums';

/** 查询字段的布局配置，字段名称和业务标签由组件维护。 */
type MessageFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
/** 收发日期查询使用的纯日期区间。 */
type MessageDateRange = [string, string] | null;

const DATE_FORMAT = 'YYYY-MM-DD';
const directionOptions = Object.values(MessageDirection).map((value) => ({
  value,
  label: MESSAGE_DIRECTION_LABELS[value],
}));
const businessTypeOptions = Object.values(MessageBusinessType).map((value) => ({
  value,
  label: MESSAGE_BUSINESS_TYPE_LABELS[value],
}));
const msgRecvStatusOptions = Object.values(MsgRecvStatus).map((value) => ({
  value,
  label: MSG_RECV_STATUS_LABELS[value],
}));
// 发报状态暂用当前枚举，正式代码待后端确认。
const msgSendStatusOptions = Object.values(MsgSendStatus).map((value) => ({
  value,
  label: MSG_SEND_STATUS_LABELS[value],
}));
const messageChannelOptions = Object.values(MessageChannel).map((value) => ({ value, label: value }));

/** 收发方向：MSG_DIRECTION */
export const MessageDirectionFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const department = Form.useWatch<string>('msgOwnerDept', { form, preserve: true });
  const group = Form.useWatch<string>('msgOwnerGroup', { form, preserve: true });

  // Owner 输入后选择 IN；只响应 Owner 值的变化，避免手动切到 OU 时被旧值切回 IN。
  useEffect(() => {
    const hasOwner = department?.trim() || group?.trim();
    if (!hasOwner) return;
    form.setFieldValue('msgDirection', MessageDirection.In);
  }, [form, department, group]);

  return (
    <Form.Item
      {...props}
      name='msgDirection'
      label='Direction'
      rules={[{ required: true, message: 'Please select Direction.' }]}
      help={false}
      hasFeedback={{ icons: renderFilterFeedback }}
    >
      <Select className='w-full' placeholder='Select direction' options={directionOptions} />
    </Form.Item>
  );
};

/** 业务类型：BUSINESS_TYPE */
export const MessageBusinessTypeFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const tranId = Form.useWatch<string>('tranId', { form, preserve: true });
  const amountFrom = Form.useWatch<number | null>('amountFrom', { form, preserve: true });
  const amountTo = Form.useWatch<number | null>('amountTo', { form, preserve: true });
  const currency = Form.useWatch<string>('currency', { form, preserve: true });
  // 交易标识、金额或币种有值时，由本字段 Rule 要求必填；金额 0 也属于已填写。
  const required = Boolean(tranId || currency) || typeof amountFrom === 'number' || typeof amountTo === 'number';

  // 监听交易标识的变化，将自身业务类型切到 PAY。
  useEffect(() => {
    if (!tranId?.trim()) return;
    form.setFieldValue('businessType', MessageBusinessType.Payment);
  }, [form, tranId]);

  return (
    <Form.Item
      {...props}
      name='businessType'
      label='Business Type'
      dependencies={['tranId', 'amountFrom', 'amountTo', 'currency']}
      rules={[{ required, message: 'Select Business Type for refTxn20, amount or currency.' }]}
      help={false}
      hasFeedback={{ icons: renderFilterFeedback }}
      tooltip='Required when refTxn20, amount or currency is entered.'
    >
      <Select className='w-full' allowClear placeholder='All' options={businessTypeOptions} />
    </Form.Item>
  );
};

/** 收发状态：MSG_RECV_STATUS / MSG_SEND_STATUS */
export const MessageStatusFilter = (props: MessageFilterFormItemProps) => {
  const direction = Form.useWatch<MessageDirection>('msgDirection');
  return (
    <>
      {!direction && (
        <Form.Item {...props} label='Status'>
          <Select className='w-full' disabled placeholder='Select direction first' />
        </Form.Item>
      )}
      <MessageRecvStatusFilter {...props} />
      <MessageSendStatusFilter {...props} />
    </>
  );
};

/** 收发日期：MSG_RECV_DATE / MSG_SEND_DATE */
export const MessageDateRangeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='msgDateRange'
    label='Message Date'
    getValueFromEvent={(dates: [Dayjs, Dayjs] | null): MessageDateRange => {
      return dates ? [dates[0].format(DATE_FORMAT), dates[1].format(DATE_FORMAT)] : null;
    }}
    // Form 中的字符串转回 Dayjs，供日期控件显示。
    getValueProps={(value?: MessageDateRange) => ({
      value: value ? [dayjs(value[0]), dayjs(value[1])] : null,
    })}
  >
    <DatePicker.RangePicker
      className='w-full'
      format={DATE_FORMAT}
      disabledDate={isMessageDateDisabled}
      presets={messageDatePresets}
    />
  </Form.Item>
);

/** 报文类型：MSG_TYPE */
export const MessageTypeFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgType' label='Message Type' normalize={trimWhitespace}>
    <Input allowClear placeholder='e.g. pacs.008.001.01' />
  </Form.Item>
);

/** 业务流水号：MSG_BUSINESS_NO */
export const MessageBusinessNoFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgBusinessNo' label='Business No.' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter business number' />
  </Form.Item>
);

/** 报文标识号：MSG_ID */
export const MessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgId' label='Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter message ID' />
  </Form.Item>
);

/** 交易标识号：TRAN_ID */
export const TranIdFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const businessType = Form.useWatch<MessageBusinessType>('businessType', form);

  // 类型变为非 PAY 时清空自身；未选择类型时保留输入，由条件必填 Rule 提示。
  useEffect(() => {
    if (!businessType || businessType === MessageBusinessType.Payment) return;
    form.setFieldValue('tranId', '');
  }, [form, businessType]);

  return (
    <Form.Item
      {...props}
      name='tranId'
      label='refTxn20'
      normalize={trimWhitespace}
      tooltip='Entering a transaction ID selects PAY.'
    >
      <Input allowClear placeholder='Enter transaction ID' />
    </Form.Item>
  );
};

/** 金额与币种：REMIT_AMOUNT/REMIT_CCY、NETTING_AMOUNT/BILL_CCY、GPI_AMOUNT/GPI_CCY */
export const MessageAmountCurrencyFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const businessType = Form.useWatch<MessageBusinessType>('businessType', form);
  const previousBusinessTypeRef = useRef(businessType);
  const disabled = businessType === MessageBusinessType.Other;

  useEffect(() => {
    const previousType = previousBusinessTypeRef.current;
    previousBusinessTypeRef.current = businessType;
    if (!businessType) return;
    const meaningChanged = Boolean(previousType) && previousType !== businessType;
    if (!disabled && !meaningChanged) return;
    form.setFieldValue('amountFrom', null);
    form.setFieldValue('amountTo', null);
    form.setFieldValue('currency', undefined);
  }, [form, businessType, disabled]);

  return (
    <Form.Item {...props} label='Amount' tooltip={getAmountCurrencyHint(businessType)}>
      <div className='flex items-center gap-1'>
        <div className='w-24 shrink-0'>
          <Form.Item name='currency' noStyle>
            <Select
              className='w-full'
              disabled={disabled}
              allowClear
              placeholder='Currency'
              options={['USD', 'HKD', 'CNY', 'EUR', 'GBP', 'JPY'].map((value) => ({ value, label: value }))}
            />
          </Form.Item>
        </div>
        <span className='shrink-0'>:</span>
        <Form.Item
          name='amountFrom'
          noStyle
          help={false}
          hasFeedback={{ icons: renderFilterFeedback }}
          dependencies={['amountTo']}
          rules={[
            () => ({
              validator: (_, amountFrom?: number | null) => {
                const amountTo = form.getFieldValue('amountTo');
                if (typeof amountFrom !== 'number' || typeof amountTo !== 'number') return Promise.resolve();
                if (amountFrom <= amountTo) return Promise.resolve();
                return Promise.reject(new Error('Minimum amount must not exceed maximum amount.'));
              },
            }),
          ]}
        >
          <InputNumber
            className='min-w-0 flex-1'
            disabled={disabled}
            controls={false}
            precision={2}
            placeholder='Minimum'
          />
        </Form.Item>
        <span className='shrink-0'>-</span>
        <Form.Item name='amountTo' noStyle>
          <InputNumber
            className='min-w-0 flex-1'
            disabled={disabled}
            controls={false}
            precision={2}
            placeholder='Maximum'
          />
        </Form.Item>
      </div>
    </Form.Item>
  );
};

/** 收发报通道：MSG_CHANNEL */
export const MessageChannelFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='channel' label='Channel' normalize={normalizeMultipleValues}>
    <Select
      className='w-full'
      allowClear
      mode='multiple'
      maxTagCount='responsive'
      placeholder='All'
      options={messageChannelOptions}
    />
  </Form.Item>
);

/** 报文归属或来源系统：MSG_OWNER_DEPT / MSG_OWNER_GROUP / OU.FROM_SYSTEM */
export const MessageOwnerFilter = (props: MessageFilterFormItemProps) => {
  const direction = Form.useWatch<MessageDirection>('msgDirection');
  return (
    <>
      {!direction && (
        <Form.Item {...props} label='Owner / Source'>
          <Input disabled placeholder='Select direction first' />
        </Form.Item>
      )}
      <MessageOwnerByFilter {...props} />
      <MessageFromSystemFilter {...props} />
    </>
  );
};

/** 报文归属：MSG_OWNER_DEPT / MSG_OWNER_GROUP */
const MessageOwnerByFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const direction = Form.useWatch<MessageDirection>('msgDirection', form);
  const hidden = direction !== MessageDirection.In;

  // Direction 切到 OU 时，清空本组件拥有的部门和组。
  useEffect(() => {
    if (direction !== MessageDirection.Out) return;
    form.setFieldValue('msgOwnerDept', '');
    form.setFieldValue('msgOwnerGroup', '');
  }, [form, direction]);

  if (hidden) return null;
  return (
    <Form.Item {...props} label='Owner By' tooltip='Available for Received direction.'>
      <Space.Compact block>
        <Form.Item name='msgOwnerDept' noStyle normalize={trimWhitespace}>
          <Input className='min-w-0 flex-1' allowClear placeholder='Department' />
        </Form.Item>
        <Form.Item name='msgOwnerGroup' noStyle normalize={trimWhitespace}>
          <Input className='min-w-0 flex-1' allowClear placeholder='Group' />
        </Form.Item>
      </Space.Compact>
    </Form.Item>
  );
};

/** 发报来源系统：OU.FROM_SYSTEM */
const MessageFromSystemFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const direction = Form.useWatch<MessageDirection>('msgDirection', form);
  const hidden = direction !== MessageDirection.Out;

  // Direction 切到 IN 时，清空仅属于 OU 表的来源系统。
  useEffect(() => {
    if (direction !== MessageDirection.In) return;
    form.setFieldValue('fromSystem', '');
  }, [form, direction]);

  if (hidden) return null;
  return (
    <Form.Item
      {...props}
      name='fromSystem'
      label='From System'
      normalize={trimWhitespace}
      tooltip='Available for Sent direction.'
    >
      <Input allowClear placeholder='Enter source system' />
    </Form.Item>
  );
};

/** 主报文编号：MAIN_MSG_ID */
export const MainMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='mainMsgId' label='Main Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter main message ID' />
  </Form.Item>
);

/** 关联流水号：MSG_RELATED_ID */
export const RelatedMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgRelatedId' label='Related Message ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter related message ID' />
  </Form.Item>
);

/** 端到端流水号：MSG_END_ID */
export const EndToEndMessageIdFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgEndId' label='End-to-End ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter end-to-end ID' />
  </Form.Item>
);

/** UETR 唯一标识号：MSG_UETR */
export const MessageUetrFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgUetr' label='UETR' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter UETR' />
  </Form.Item>
);

/** 发送行 BIC：MSG_SEND_BIC */
export const MessageSendBicFilter = (props: MessageFilterFormItemProps) => (
  <Form.Item {...props} name='msgSendBic' label='Sender Bank' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter sender bank BIC' />
  </Form.Item>
);

/** 收报状态：MSG_RECV_STATUS */
const MessageRecvStatusFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const direction = Form.useWatch<MessageDirection>('msgDirection', form);
  const hidden = direction !== MessageDirection.In;

  // 切到发报方向时清空自身；等待 useWatch 取得方向，避免初始化时误清空已有收报状态。
  useEffect(() => {
    if (direction !== MessageDirection.Out) return;
    form.setFieldValue('msgRecvStatus', undefined);
  }, [form, direction]);

  if (hidden) return null;
  return (
    <Form.Item {...props} name='msgRecvStatus' label='Received Status' normalize={normalizeMultipleValues}>
      <Select
        className='w-full'
        allowClear
        mode='multiple'
        maxTagCount='responsive'
        placeholder='All'
        options={msgRecvStatusOptions}
      />
    </Form.Item>
  );
};

/** 发报状态：MSG_SEND_STATUS */
const MessageSendStatusFilter = (props: MessageFilterFormItemProps) => {
  const form = Form.useFormInstance();
  const direction = Form.useWatch<MessageDirection>('msgDirection', form);
  const hidden = direction !== MessageDirection.Out;

  // 切到收报方向时清空自身；等待 useWatch 取得方向，避免初始化时误清空已有发报状态。
  useEffect(() => {
    if (direction !== MessageDirection.In) return;
    form.setFieldValue('msgSendStatus', undefined);
  }, [form, direction]);

  if (hidden) return null;
  return (
    <Form.Item {...props} name='msgSendStatus' label='Sent Status' normalize={normalizeMultipleValues}>
      <Select
        className='w-full'
        allowClear
        mode='multiple'
        maxTagCount='responsive'
        placeholder='All'
        options={msgSendStatusOptions}
      />
    </Form.Item>
  );
};

const trimWhitespace = (value?: string) => value?.trim() ?? '';

/** 多选字段持有独立数组，并将清空后的空数组统一转换为空值。 */
const normalizeMultipleValues = <Value,>(values?: Value[]) => (values?.length ? [...values] : undefined);

/** 业务类型确定金额和币种的含义，说明只面向业务使用者。 */
const getAmountCurrencyHint = (businessType?: MessageBusinessType) => {
  if (businessType === MessageBusinessType.Query)
    return 'Amount and currency apply only to messages with GPI information.';
  if (businessType === MessageBusinessType.Other) return 'Amount and currency are not available for OTHER.';
  return 'Select Business Type before searching with an amount or currency.';
};

/** 筛选校验错误通过反馈图标展示 Tooltip，其他校验状态不显示图标。 */
const renderFilterFeedback: FeedbackIcons = ({ errors }) => ({
  error: (
    <Tooltip
      title={errors?.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
      trigger={['hover', 'focus']}
    >
      <CloseCircleFilled className='pointer-events-auto' tabIndex={0} />
    </Tooltip>
  ),
  success: false,
  warning: false,
  validating: false,
});
