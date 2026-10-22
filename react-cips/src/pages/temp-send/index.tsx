import { useState } from 'react';
import type { FormInstance } from 'antd';
import type { TempSendGeneratedMessage } from '@/api/tempSend';
import { Alert, Button, Card, Empty, Form, Input } from 'antd';
import { CheckOutlined, FileTextOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import RawSingle from '@/components/ContentMessageRaw/RawSingle';
import { TempSendMessageType } from '@/components/FormItem/tempSend';
import { useDictionaryOptions } from '@/store/useDictionaryStore';
import { DictionaryOptionsEnum } from '@/types/enums';
import { tempSendForms } from './TempSendFields';
import SplitterPersistent from './SplitterPersistent';
import { useTempSend } from './useTempSend';

/** 组装模板选择、拼报表单与报文原文 */
const TempSend = () => {
  const [messageType, setMessageType] = useLocalStorageState<string>(MESSAGE_TYPE_STORAGE_KEY, {
    defaultValue: DEFAULT_MESSAGE_TYPE,
    serializer: (value) => value,
    deserializer: (value) => (Object.keys(tempSendForms).includes(value) ? value : DEFAULT_MESSAGE_TYPE),
  });
  const { form, generated, changed, submitted, generateError, handleGenerate, handleValuesChange, handleSend } =
    useTempSend(messageType);

  return (
    <SplitterPersistent
      storageKey='temp-send-panel-width'
      left={(compact) => (
        <div className='flex h-full flex-col gap-5'>
          {/* 窄屏: 报文类型下拉 */}
          <div className={compact ? 'shrink-0' : 'shrink-0 lg:hidden'}>
            <TempSendMessageType value={messageType} onChange={setMessageType} />
          </div>
          {/* 宽屏: 报文类型菜单 */}
          <div className='flex min-h-0 flex-1 gap-3 overflow-hidden'>
            <MenuTempSend compact={compact} messageType={messageType} onChange={setMessageType} />
            <CardTempSendForm
              messageType={messageType}
              form={form}
              generated={Boolean(generated)}
              generateError={generateError}
              onGenerate={handleGenerate}
              onValuesChange={handleValuesChange}
            />
          </div>
        </div>
      )}
      right={<CardTempSendRaw generated={generated} changed={changed} submitted={submitted} onSend={handleSend} />}
    />
  );
};

/** 搜索并选择报文模板 */
const MenuTempSend = ({ compact, messageType, onChange }: TempSendMenuProps) => {
  const [search, setSearch] = useState('');
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.MsgTypeTempSend);
  const filteredOptions = options.filter((option) =>
    `${option.value} ${option.label}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Card
      size='small'
      title='Template Send'
      extra={<span className='text-xs font-normal text-gray-400'>{options.length} templates</span>}
      className={`w-60 shrink-0 flex-col overflow-hidden ${compact ? 'hidden' : 'hidden lg:flex'}`}
      classNames={{ body: 'flex min-h-0 flex-1 flex-col gap-4' }}
    >
      {/* 菜单顶部搜索框 */}
      <Input
        prefix={<SearchOutlined className='text-gray-400' />}
        placeholder='Search code or name'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
      />
      <nav className='flex min-h-0 flex-1 flex-col gap-1 overflow-auto'>
        {filteredOptions.map((option) => (
          <Button
            key={option.value}
            block
            color={messageType === option.value ? 'primary' : 'default'}
            variant={messageType === option.value ? 'filled' : 'text'}
            className='shrink-0 !h-auto !justify-start !px-3 !py-2 !text-left'
            aria-pressed={messageType === option.value}
            onClick={() => onChange(option.value)}
          >
            <div className='flex w-full min-w-0 items-center gap-3'>
              <FileTextOutlined className='shrink-0' />
              <div className='min-w-0 flex-1'>
                <div className='font-mono text-xs opacity-60'>{option.value}</div>
                <div className='mt-1 whitespace-normal text-sm font-medium leading-5'>{option.label}</div>
              </div>
              {/* 保留勾选图标占位，避免切换时文字宽度变化 */}
              <CheckOutlined className={`shrink-0 ${messageType === option.value ? 'visible' : 'invisible'}`} />
            </div>
          </Button>
        ))}
        {filteredOptions.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No templates found' />
        )}
      </nav>
    </Card>
  );
};

/** 编辑模板字段并发起拼报 */
const CardTempSendForm = ({
  messageType,
  form,
  generated,
  generateError,
  onGenerate,
  onValuesChange,
}: TempSendFormCardProps) => {
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.MsgTypeTempSend);
  const Fields = tempSendForms[messageType];
  const templateLabel = options.find((option) => option.value === messageType)?.label ?? messageType;

  return (
    <Form
      key={messageType}
      form={form}
      layout='vertical'
      className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
      onFinish={onGenerate}
      onValuesChange={onValuesChange}
      scrollToFirstError={{ block: 'center', focus: true }}
      validateMessages={{
        required: '${label} is required',
        string: { max: '${label} must not exceed ${max} characters' },
      }}
    >
      <Card
        extra={
          <Button type='primary' htmlType='submit' icon={<FileTextOutlined />}>
            {generated ? 'Regenerate' : 'Generate'}
          </Button>
        }
        title={
          <div className='py-3'>
            <div className='font-mono text-xs font-normal text-gray-400'>{messageType}</div>
            <h2 className='mb-0 mt-1 whitespace-normal text-lg font-semibold text-gray-900'>{templateLabel}</h2>
          </div>
        }
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
        classNames={{ body: 'min-h-0 flex-1 overflow-auto' }}
      >
        <p className='mb-6 mt-0 text-sm leading-6 text-gray-500'>{templateDescriptions[messageType]}</p>
        {generateError && <Alert className='mb-4' type='error' showIcon message={generateError} />}
        <Fields />
      </Card>
    </Form>
  );
};

/** 展示报文原文并发起发送 */
const CardTempSendRaw = ({ generated, changed, submitted, onSend }: TempSendRawCardProps) => (
  <Card
    title='Raw Message'
    extra={
      <Button type='primary' icon={<SendOutlined />} onClick={onSend}>
        Send
      </Button>
    }
    className='flex min-h-0 flex-1 flex-col overflow-hidden'
    classNames={{ body: 'flex min-h-0 flex-1 flex-col gap-3 overflow-hidden' }}
  >
    {submitted && <Alert type='success' showIcon message='Message submitted successfully' />}
    {generated && changed && (
      <Alert
        type='warning'
        showIcon
        message='Generate again before sending. The preview is from the previous generation.'
      />
    )}
    {generated ? (
      <RawSingle key={generated.msgId} raw={generated} />
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description='Fill in the form and generate a message to preview it here.'
      />
    )}
  </Card>
);

export default TempSend;

/** 模板菜单属性 */
interface TempSendMenuProps {
  /** 是否收起菜单 */
  compact: boolean;
  /** 当前报文类型 */
  messageType: string;
  /** 切换报文类型 */
  onChange: (messageType: string) => void;
}

/** 表单卡片属性 */
interface TempSendFormCardProps {
  /** 当前报文类型 */
  messageType: string;
  /** 表单实例 */
  form: FormInstance;
  /** 是否已生成报文 */
  generated: boolean;
  /** 拼报失败提示 */
  generateError: string;
  /** 提交拼报 */
  onGenerate: (values: Record<string, unknown>) => Promise<void>;
  /** 标记表单修改 */
  onValuesChange: () => void;
}

/** 原文卡片属性 */
interface TempSendRawCardProps {
  /** 已生成的报文 */
  generated?: TempSendGeneratedMessage;
  /** 是否需要重新拼报 */
  changed: boolean;
  /** 是否已提交 */
  submitted: boolean;
  /** 确认发送 */
  onSend: () => void;
}

const MESSAGE_TYPE_STORAGE_KEY = 'temp-send-message-type';
const DEFAULT_MESSAGE_TYPE = 'cips.303.001.02';

const templateDescriptions: Readonly<Record<string, string>> = {
  'cips.303.001.02': 'Request cancellation of a previously submitted payment.',
  'cips.305.001.03': 'Query the processing status of an existing payment.',
  'cips.307.001.01': 'Send signed business information and an optional attachment.',
  'cips.313.001.01': 'Query your current cross-border settlement queue.',
  'cips.350.001.01': 'Request a reduction of your participant account balance.',
  'cips.351.001.01': 'Request a reduction of your prefunded balance.',
  'cips.353.001.02': 'Move a queued payment to the front or back of its priority group.',
  'cips.354.001.01': 'Update an account balance or available net debit limit warning threshold.',
};
