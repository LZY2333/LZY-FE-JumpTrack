import { useState } from 'react';
import { Alert, App, Button, Card, Empty, Form, Input } from 'antd';
import { CheckOutlined, FileTextOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { sendTempMessage } from '@/api/tempSend';
import type { TempSendRequest } from '@/api/tempSend';
import { TempSendMessageType } from '@/components/FormItem/tempSend';
import { useDictionaryOptions } from '@/store/useDictionaryStore';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { DictionaryOptionsEnum } from '@/types/enums';
import { omitEmptyValues } from '@/utils';
import { tempSendForms } from './TempSendFields';

/** 当前模板属性 */
interface TempSendFormProps {
  /** 完整报文类型 */
  messageType: string;
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

/** 选择模板并编辑报文 */
const TempSend = () => {
  const [messageType, setMessageType] = useLocalStorageState<string>(MESSAGE_TYPE_STORAGE_KEY, {
    defaultValue: DEFAULT_MESSAGE_TYPE,
    serializer: (value) => value,
    deserializer: (value) => (Object.keys(tempSendForms).includes(value) ? value : DEFAULT_MESSAGE_TYPE),
  });
  const [search, setSearch] = useState('');
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.MsgTypeTempSend);
  const filteredOptions = options.filter((option) =>
    `${option.value} ${option.label}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className='flex h-full min-h-0 w-full flex-col gap-5 overflow-hidden'>
      {/* 小窗口 顶部下拉报文类型 */}
      <div className='shrink-0 lg:hidden'>
        <TempSendMessageType value={messageType} onChange={setMessageType} />
      </div>

      <div className='flex min-h-0 flex-1 gap-5 overflow-hidden'>
        {/* 大窗口 左侧菜单，默认hidden */}
        <Card
          size='small'
          title='Template Send'
          extra={<span className='text-xs font-normal text-gray-400'>{options.length} templates</span>}
          className='hidden w-72 shrink-0 flex-col overflow-hidden lg:flex xl:w-80'
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
          <nav className='flex min-h-0 flex-1 flex-col gap-2 overflow-auto'>
            {filteredOptions.map((option) => (
              <Button
                key={option.value}
                block
                color={messageType === option.value ? 'primary' : 'default'}
                variant={messageType === option.value ? 'filled' : 'text'}
                className='shrink-0 !h-auto !justify-start !px-3 !py-3 !text-left'
                aria-pressed={messageType === option.value}
                onClick={() => setMessageType(option.value)}
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

        {/* 右侧表单: 切换模板时重建表单，避免沿用上一张报文的数据 */}
        <FormTempSend key={messageType} messageType={messageType} />
      </div>
    </div>
  );
};

/** 编辑当前报文并固定顶部操作区 */
export const FormTempSend = ({ messageType }: TempSendFormProps) => {
  const [form] = Form.useForm();
  const [submitError, setSubmitError] = useState('');
  const { message } = App.useApp();
  const { options } = useDictionaryOptions(DictionaryOptionsEnum.MsgTypeTempSend);
  const Fields = tempSendForms[messageType];
  const templateLabel = options.find((option) => option.value === messageType)?.label ?? messageType;

  const handleSend = async (values: Record<string, unknown>) => {
    // 提交已校验的字段
    setSubmitError('');
    const stopLoading = startGlobalLoading();
    try {
      await sendTempMessage(buildTempSendRequest(messageType, values));
      message.success('Message submitted successfully');
    } catch {
      // 接口层提示原因，保留填写内容
      setSubmitError('Submission failed. Check the error details.');
    } finally {
      stopLoading();
    }
  };

  return (
    <Form
      form={form}
      layout='vertical'
      className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
      onFinish={handleSend}
      scrollToFirstError={{ block: 'center', focus: true }}
      validateMessages={{
        required: '${label} is required',
        string: { max: '${label} must not exceed ${max} characters' },
      }}
    >
      <Card
        title={
          <div className='py-3'>
            <div className='font-mono text-xs font-normal text-gray-400'>{messageType}</div>
            <h2 className='mb-0 mt-1 whitespace-normal text-lg font-semibold text-gray-900'>{templateLabel}</h2>
          </div>
        }
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
        classNames={{ body: 'flex min-h-0 flex-1 flex-col overflow-hidden' }}
      >
        <div className='min-h-0 flex-1 overflow-auto'>
          <div className='w-full max-w-4xl'>
            <p className='mb-6 mt-0 text-sm leading-6 text-gray-500'>{templateDescriptions[messageType]}</p>
            {submitError && <Alert className='mb-4' type='error' showIcon message={submitError} />}
            <div className='grid grid-cols-1 gap-x-6 gap-y-5 xl:grid-cols-2'>
              <Fields />
              <div className='col-span-full'>
                <Button type='primary' htmlType='submit' icon={<SendOutlined />}>
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Form>
  );
};

/** 清理待提交的模板字段 */
export const buildTempSendRequest = (messageType: string, formValues: Record<string, unknown>): TempSendRequest => ({
  messageType,
  formValues: omitEmptyValues(formValues),
});

export default TempSend;
