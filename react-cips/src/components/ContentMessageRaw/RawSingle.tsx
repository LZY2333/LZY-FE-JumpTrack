import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { App, Button, Empty, Space } from 'antd';
import { CopyOutlined, PrinterOutlined } from '@ant-design/icons';
import type { MessageRaw } from '@/api/messages';
import CodeMirrorXML from '@/components/CodeMirrorXML';
import type { CodeMirrorXMLRef } from '@/components/CodeMirrorXML';
import useRawActions from './useRawActions';

/** 单条报文原文展示参数 */
interface RawSingleProps {
  /** 当前展示的报文原文 */
  raw: MessageRaw;
  /** 是否允许编辑 */
  editable?: boolean;
}

/** 单条报文原文操作接口 */
export interface RawSingleRef {
  /** 获取通过非空校验的编辑内容 */
  getUpdatedContent(): string | undefined;
  /** 恢复接口返回的原文 */
  resetCurrent(): void;
  /** 复制当前完整内容 */
  copyCurrent(): Promise<void>;
  /** 打印当前内容并保留 XML 折叠状态 */
  printCurrent(): void;
}

/** 自适应父级可用高度，展示或编辑单条报文并提供当前报文操作 */
const RawSingle = forwardRef<RawSingleRef, RawSingleProps>(({ raw, editable = false }, forwardedRef) => {
  const { message } = App.useApp();
  const codeMirrorXMLRef = useRef<CodeMirrorXMLRef>(null);
  const [editedContent, setEditedContent] = useState(raw.msgContent);
  const currentContent = editable ? editedContent : raw.msgContent;
  const { copyCurrent, printCurrent } = useRawActions({
    msgId: raw.msgId,
    content: currentContent,
    getPrintableValue: () => codeMirrorXMLRef.current?.getPrintableValue() ?? currentContent,
  });

  /** 获取手工补录待更新的原文 */
  const getUpdatedContent = () => {
    if (!currentContent.trim()) {
      message.warning('Raw message content is required');
      return undefined;
    }
    return currentContent;
  };

  /** 恢复本次加载的原文 */
  const resetCurrent = () => {
    setEditedContent(raw.msgContent);
    message.success('Raw message reset');
  };

  useImperativeHandle(forwardedRef, () => ({ getUpdatedContent, resetCurrent, copyCurrent, printCurrent }));

  const handleCopy = () => copyCurrent();
  const handlePrint = () => printCurrent();
  const toolbarExtra = (
    <Space size={8}>
      <Button size='small' icon={<CopyOutlined />} onClick={handleCopy} disabled={!currentContent}>
        Copy
      </Button>
      <Button size='small' icon={<PrinterOutlined />} onClick={handlePrint} disabled={!currentContent}>
        Print
      </Button>
    </Space>
  );

  if (editable) {
    return (
      <CodeMirrorXML
        ref={codeMirrorXMLRef}
        className='min-h-0 flex-1'
        value={currentContent}
        onChange={setEditedContent}
        toolbarExtra={toolbarExtra}
      />
    );
  }
  if (!currentContent) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <div className='flex shrink-0 justify-end'>{toolbarExtra}</div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No raw message' />
      </div>
    );
  }
  return (
    <CodeMirrorXML
      ref={codeMirrorXMLRef}
      className='min-h-0 flex-1'
      value={currentContent}
      readOnly
      toolbarExtra={toolbarExtra}
    />
  );
});

RawSingle.displayName = 'RawSingle';

export default RawSingle;
