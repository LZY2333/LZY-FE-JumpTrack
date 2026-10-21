import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { App, Button, Form, Input, InputNumber, Select, Space } from 'antd';
import type { InputNumberProps } from 'antd';
import { useDictionaryOptions } from '@/store/useDictionaryStore';
import { DictionaryOptionsEnum } from '@/types/enums';
import { formatMessageAmount, getSelectValueProps } from '@/utils';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 原报文类型场景 */
interface TempSendOriginalTypeProps {
  /** 撤销或状态查询 */
  business: 'cancellation' | 'statusQuery';
}

/** 调减金额场景 */
interface TempSendReductionProps {
  /** 资金或预注资 */
  business: 'funds' | 'prefunding';
}

/** 发起行场景 */
interface TempSendDirectMemberProps {
  /** 请求发起行或原排队业务发起行 */
  business?: 'request' | 'queue';
}

/** 模板报文类型属性 */
interface TempSendMessageTypeProps {
  /** 当前报文类型 */
  value?: string;
  /** 切换报文类型 */
  onChange: (value: string) => void;
}

/** 附件字段属性 */
interface TempSendAttachmentInputProps {
  /** 纯 Base64 内容 */
  value?: string;
  /** 更新附件内容 */
  onChange?: (value: string) => void;
}

/* ==================== 报文类型选择 ==================== */

/** 模板报文类型：MESSAGE_TYPE */
export const TempSendMessageType = ({ value, onChange }: TempSendMessageTypeProps) => {
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.MsgTypeTempSend);

  return (
    <Select
      aria-label='Message Type'
      className='w-full'
      placeholder='Select message type'
      showSearch
      optionFilterProp='label'
      value={value}
      onChange={onChange}
      options={options.map((option) => ({ ...option, label: `${option.value} ${option.label}` }))}
    />
  );
};

/* ==================== 通用字段 ==================== */

/** 原报文标识号：ORG_MSG_ID */
export const OrgMsgId = () => (
  <Form.Item
    name='orgMsgId'
    label='Original Message ID'
    rules={[{ required: true, max: 35 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 原报文类型：ORG_MSG_TYPE */
export const OrgMsgType = ({ business }: TempSendOriginalTypeProps) => {
  const { options } = useDictionaryOptions(
    business === 'cancellation'
      ? DictionaryOptionsEnum.TempSendCancellationMsgType
      : DictionaryOptionsEnum.TempSendStatusQueryMsgType,
  );

  return (
    <Form.Item
      name='orgMsgType'
      label='Original Message Type'
      rules={[{ required: true }]}
      getValueProps={getSelectValueProps}
    >
      <Select
        className='w-full'
        showSearch
        optionFilterProp='label'
        placeholder='Select an option'
        options={options.map((option) => ({ ...option, label: `${option.value} ${option.label}` }))}
      />
    </Form.Item>
  );
};

/** 明细报文标识号：END_TO_END_IDENTIFICATION */
export const EndToEndIdentification = () => (
  <Form.Item
    name='endToEndIdentification'
    label='End-to-End Identification'
    rules={[{ max: 35 }]}
    tooltip='For clearing institution lending or borrowing transactions'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 查询直接参与者行号：QUERY_DIRECT_MEMBER_ID */
export const QueryDirectMemberId = () => (
  <Form.Item
    name='queryDirectMemberId'
    label='Querying Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    initialValue='WUBAHKHHXXX'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 发起直接参与者行号：DIRECT_MEMBER_ID */
export const DirectMemberId = ({ business = 'request' }: TempSendDirectMemberProps) => {
  const label = business === 'queue' ? 'Original Initiating Direct Participant ID' : 'Initiating Direct Participant ID';
  return (
    <Form.Item
      name='directMemberId'
      label={label}
      rules={[{ required: true, max: 35 }]}
      initialValue='WUBAHKHHXXX'
      getValueProps={getInputValueProps}
    >
      <Input maxLength={35} />
    </Form.Item>
  );
};

/** 调减金额：TRANSFERRED_AMOUNT */
export const TransferredAmount = ({ business }: TempSendReductionProps) => {
  const label = business === 'prefunding' ? 'Prefunding Reduction Amount' : 'Reduction Amount';
  return (
    <Form.Item name='transferredAmount' label={label} rules={[{ required: true }]}>
      <AmountInput />
    </Form.Item>
  );
};

/** 币种：CURRENCY */
// 原模板提示固定 CNY，但仅配置默认值和长度限制，暂不增加固定值校验
export const Currency = () => (
  <Form.Item
    name='currency'
    label='Currency'
    rules={[{ required: true, max: 3 }]}
    initialValue='CNY'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={3} />
  </Form.Item>
);

/** 被调整行行号：ADJUSTED_DIRECT_MEMBER_ID */
// 只能调整本行，预注资不能为被托管行调减；原模板未校验与发起行相等，暂保留独立输入
export const AdjustedDirectMemberId = () => (
  <Form.Item
    name='adjustedDirectMemberId'
    label='Adjusted Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    initialValue='WUBAHKHHXXX'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/* ==================== 303 业务撤销申请专有字段 ==================== */

/** 原金额：ORG_INTERBANK_SETTLEMENT_AMOUNT */
export const OrgInterbankSettlementAmount = () => (
  <Form.Item
    name='orgInterbankSettlementAmount'
    label='Original Interbank Settlement Amount'
    rules={[{ required: true }]}
  >
    <AmountInput />
  </Form.Item>
);

/** 撤销直接参与者行号：CANCEL_DIRECT_MEMBER_ID */
export const CancelDirectMemberId = () => (
  <Form.Item
    name='cancelDirectMemberId'
    label='Cancelling Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    initialValue='WUBAHKHHXXX'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 撤销间接参与者行号：CANCEL_INDIRECT_MEMBER_ID */
export const CancelIndirectMemberId = () => (
  <Form.Item
    name='cancelIndirectMemberId'
    label='Cancelling Indirect Participant ID'
    rules={[{ max: 35 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/* ==================== 305 业务状态查询申请专有字段 ==================== */

/** 查询间接参与者行号：QUERY_INDIRECT_MEMBER_ID */
export const QueryIndirectMemberId = () => (
  <Form.Item
    name='queryIndirectMemberId'
    label='Querying Indirect Participant ID'
    rules={[{ max: 35 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 原业务发起直接参与者行号：ORG_BUSI_DIRECT_MEMBER_ID */
export const OrgBusiDirectMemberId = () => (
  <Form.Item
    name='orgBusiDirectMemberId'
    label='Original Initiating Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/* ==================== 307 通用签名信息业务专有字段 ==================== */

/** 发起直接参与者行号：INSTRUCTING_PARTY */
export const InstructingParty = () => (
  <Form.Item
    name='instructingParty'
    label='Instructing Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    initialValue='WUBAHKHHXXX'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 接收直接参与者行号：INSTRUCTED_PARTY */
export const InstructedParty = () => (
  <Form.Item
    name='instructedParty'
    label='Instructed Direct Participant ID'
    rules={[{ required: true, max: 35 }]}
    initialValue='CMBCCNBSXXX'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 业务类型名称：TRANSACTION_TYPE_NAME */
export const TransactionTypeName = () => (
  <Form.Item
    name='transactionTypeName'
    label='Transaction Type Name'
    rules={[{ max: 60 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={60} />
  </Form.Item>
);

/** 信息标题：TITLE */
export const Title = () => (
  <Form.Item
    name='title'
    label='Information Title'
    rules={[{ required: true, max: 80 }]}
    getValueProps={getInputValueProps}
  >
    <Input maxLength={80} />
  </Form.Item>
);

/** 信息内容：CONTENT */
export const Content = () => (
  <Form.Item
    name='content'
    label='Information Content'
    rules={[{ required: true, max: 256 }]}
    getValueProps={getInputValueProps}
  >
    <Input.TextArea maxLength={256} rows={4} />
  </Form.Item>
);

/** 附件名称：ATTACHMENT_NAME */
export const AttachmentName = () => (
  <Form.Item name='attachmentName' label='Attachment Name' rules={[{ max: 80 }]} getValueProps={getInputValueProps}>
    <Input maxLength={80} />
  </Form.Item>
);

/** 附件内容：ATTACHMENT_CONTENT */
export const AttachmentContent = () => (
  <Form.Item name='attachmentContent' label='Attachment Content' extra='Select a local file to attach.'>
    <AttachmentInput />
  </Form.Item>
);

/* ==================== 353 排队调整申请专有字段 ==================== */

/** 待调整业务报文标识号：ORG_TX_ID */
export const OrgTxId = () => (
  <Form.Item
    name='orgTxId'
    label='Original Transaction ID'
    rules={[{ required: true, max: 35 }]}
    tooltip='For net settlement, enter the netting date, session and booked participant ID in the required sequence'
    getValueProps={getInputValueProps}
  >
    <Input maxLength={35} />
  </Form.Item>
);

/** 队列调整类型：PROPRIETARY_CODE */
export const ProprietaryCode = () => (
  <Form.Item
    name='proprietaryCode'
    label='Queue Adjustment Type'
    rules={[{ required: true }]}
    getValueProps={getSelectValueProps}
  >
    <Select
      className='w-full'
      showSearch
      optionFilterProp='label'
      placeholder='Select an option'
      options={[
        { value: 'FRST', label: 'Move to Front' },
        { value: 'FNAL', label: 'Move to Back' },
      ]}
    />
  </Form.Item>
);

/* ==================== 354 限额修改申请专有字段 ==================== */

/** 预警种类：CODE */
export const Code = () => (
  <Form.Item name='code' label='Warning Type' rules={[{ required: true }]} getValueProps={getSelectValueProps}>
    <Select
      className='w-full'
      showSearch
      optionFilterProp='label'
      placeholder='Select an option'
      options={[
        { value: 'MULT', label: 'Account Balance Warning' },
        { value: 'NELI', label: 'Available Net Debit Limit Warning' },
      ]}
    />
  </Form.Item>
);

/** 余额预警额度：AMOUNT */
export const Amount = () => (
  <Form.Item
    name='amount'
    label='Warning Threshold Amount'
    rules={[{ required: true }]}
    extra='Enter 0 to turn off the selected warning.'
  >
    <AmountInput />
  </Form.Item>
);

/* ==================== 内部控件与辅助函数 ==================== */

/** 编辑金额并保留小数精度 */
const AmountInput = (props: InputNumberProps<string>) => (
  <InputNumber<string>
    {...props}
    className='w-full'
    stringMode
    controls={false}
    formatter={(value, { userTyping, input }) => (userTyping ? input : formatMessageAmount(value ?? ''))}
    parser={(value) => (value ?? '').replace(/,/g, '')}
  />
);

/** 选择本地附件并转换为 Base64 */
const AttachmentInput = ({ value, onChange }: TempSendAttachmentInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const { message } = App.useApp();

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // 读取文件内容
    const stopLoading = startGlobalLoading();
    try {
      const content = await readAttachmentBase64(file);
      onChange?.(content);
      setSelectedFile(file);
    } catch {
      message.error('Unable to read attachment');
    } finally {
      event.target.value = '';
      stopLoading();
    }
  };

  const handleRemove = () => {
    onChange?.('');
    setSelectedFile(undefined);
  };

  /** 读取纯 Base64 附件内容 */
  const readAttachmentBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.onerror = () => reject(new Error('Unable to read attachment'));
      reader.onabort = () => reject(new Error('Attachment reading was cancelled'));
      reader.readAsDataURL(file);
    });

  return (
    <Space wrap>
      <input ref={inputRef} aria-label='Attachment file' type='file' className='hidden' onChange={handleChange} />
      <Button onClick={() => inputRef.current?.click()}>Choose File</Button>
      {value !== undefined && value !== '' && (
        <>
          <span>
            {selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)` : 'Attachment selected'}
          </span>
          <Button onClick={handleRemove}>Remove</Button>
        </>
      )}
    </Space>
  );
};

/** 归一化文本控件空值 */
const getInputValueProps = (value?: string | null) => ({ value: value ?? '' });
