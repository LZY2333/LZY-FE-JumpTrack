import { useLayoutEffect, useState } from 'react';
import { App, Form } from 'antd';
import { generateTempMessage, sendTempMessage } from '@/api/tempSend';
import type { TempSendGeneratedMessage, TempSendRequest } from '@/api/tempSend';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { omitEmptyValues } from '@/utils';

/** 拼报快照 */
interface TempSendDraft {
  /** 生成的报文 */
  message: TempSendGeneratedMessage;
  /** 拼报时提交的表单 */
  request: TempSendRequest;
}

/** 编排拼报与确认发送 */
export const useTempSend = (messageType: string) => {
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [draft, setDraft] = useState<TempSendDraft>();
  const [changed, setChanged] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // 切换模板时在绘制前重置业务状态，保留分栏尺寸和菜单实例
  useLayoutEffect(() => {
    form.resetFields();
    setDraft(undefined);
    setChanged(false);
    setSubmitted(false);
    setGenerateError('');
  }, [form, messageType]);

  const handleGenerate = async (values: Record<string, unknown>) => {
    setGenerateError('');
    const request = buildTempSendRequest(messageType, values);
    const stopLoading = startGlobalLoading();
    try {
      const result = await generateTempMessage(request);
      setDraft(result ? { message: result, request } : undefined);
      setChanged(false);
      setSubmitted(false);
    } catch {
      setChanged(true);
      setGenerateError('Generation failed. Check the error details and generate again.');
    } finally {
      stopLoading();
    }
  };

  const handleValuesChange = () => setChanged(true);

  const handleSend = () => {
    if (!draft) {
      message.warning('Generate a message first.');
      return;
    }
    if (submitted) {
      message.warning('This message has already been submitted.');
      return;
    }
    if (changed) {
      message.warning('Generate the message again before sending.');
      return;
    }
    modal.confirm({
      title: 'Confirm Send',
      content: `Submit the generated message ${draft.message.msgId} (${draft.message.messageType})?`,
      okText: 'Confirm Send',
      cancelText: 'Cancel',
      autoFocusButton: 'cancel',
      onOk: async () => {
        const stopLoading = startGlobalLoading();
        try {
          await sendTempMessage(draft.request);
          setSubmitted(true);
          message.success('Message submitted successfully');
        } finally {
          stopLoading();
        }
      },
    });
  };

  return {
    form,
    generated: draft?.message,
    changed,
    submitted,
    generateError,
    handleGenerate,
    handleValuesChange,
    handleSend,
  };
};

/** 清理待提交的模板字段 */
export const buildTempSendRequest = (messageType: string, formValues: Record<string, unknown>): TempSendRequest => ({
  messageType,
  formValues: omitEmptyValues(formValues),
});
