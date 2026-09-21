import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, App as AntdApp, Empty, Spin } from 'antd';
import CodeMirrorXML from '@/components/CodeMirrorXML';
import type { CodeMirrorXMLRef } from '@/components/CodeMirrorXML';
import { copyText } from '@/utils/fileUtil';
import { printXmlDocument } from './contentMessageRawUtil';
import useMessageRaw from './useMessageRaw';

export interface ContentMessageRawProps {
  /** 报文 ID。 */
  msgId?: string;
  /** 报文方向。 */
  msgDirection?: string;
  /** 是否启用编辑模式。 */
  editable?: boolean;
}

export interface ContentMessageRawRef {
  /** 获取通过非空和变更校验的待更新报文原文。 */
  getUpdatedContent(): string | undefined;
  /** 恢复接口首次返回的报文原文。 */
  resetCurrent(): void;
  /** 复制当前内容：编辑模式使用编辑值，只读模式使用接口原文。 */
  copyCurrent(): Promise<void>;
  /** 打印当前内容：编辑模式使用编辑值，只读模式使用接口原文。 */
  printCurrent(): void;
}

/** 查询并展示或编辑 Raw Message，统一维护当前原文及相关操作。 */
const ContentMessageRaw = forwardRef<ContentMessageRawRef, ContentMessageRawProps>(
  ({ msgId, msgDirection, editable = false }, forwardedRef) => {
    const { message } = AntdApp.useApp();
    const codeMirrorXMLRef = useRef<CodeMirrorXMLRef>(null);
    const [originRaw, setOriginRaw] = useState('');
    const [currentRaw, setCurrentRaw] = useState('');
    const { raw, rawLoading, rawError } = useMessageRaw({ msgId, msgDirection });

    useEffect(() => {
      const rawContent = raw?.msgContent ?? '';
      setOriginRaw(rawContent);
      setCurrentRaw(rawContent);
    }, [raw]);

    /** 获取可提交 Update 接口的报文原文。 */
    const getUpdatedContent = () => {
      if (rawLoading) {
        message.warning('Raw message is still loading');
        return undefined;
      }
      if (!currentRaw.trim()) {
        message.warning('Raw message content is required');
        return undefined;
      }
      return currentRaw;
    };

    /** 恢复接口首次返回的报文原文。 */
    const resetCurrent = () => {
      if (rawLoading) {
        message.warning('Raw message is still loading');
        return;
      }
      if (!raw) {
        message.warning('Raw message is empty');
        return;
      }

      setCurrentRaw(originRaw);
      message.success('Raw message reset');
    };

    /** 复制当前报文原文。 */
    const copyCurrent = async () => {
      if (rawLoading) {
        message.warning('Raw message is still loading');
        return;
      }
      if (!currentRaw) {
        message.warning('Raw message is unavailable');
        return;
      }

      try {
        await copyText(currentRaw);
        message.success('Current message copied');
      } catch {
        message.error('Failed to copy the raw message');
      }
    };

    /** 打印当前报文原文。 */
    const printCurrent = () => {
      if (rawLoading) {
        message.warning('Raw message is still loading');
        return;
      }
      if (!currentRaw) {
        message.warning('Raw message is unavailable');
        return;
      }

      const printContent = codeMirrorXMLRef.current?.getPrintableValue() ?? currentRaw;
      const opened = printXmlDocument(`${msgId || 'message'}.xml`, printContent);
      if (!opened) message.error('The print window was blocked. Allow pop-ups and try again.');
    };

    useImperativeHandle(forwardedRef, () => ({ getUpdatedContent, resetCurrent, copyCurrent, printCurrent }), [
      currentRaw,
      message,
      msgId,
      originRaw,
      raw,
      rawLoading,
    ]);

    let content = (
      <div className='flex flex-1 items-center justify-center'>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No raw message' />
      </div>
    );
    if (editable) {
      content = (
        <CodeMirrorXML ref={codeMirrorXMLRef} className='min-h-0 flex-1' value={currentRaw} onChange={setCurrentRaw} />
      );
    } else if (currentRaw) {
      content = <CodeMirrorXML ref={codeMirrorXMLRef} className='min-h-0 flex-1' value={currentRaw} readOnly />;
    }

    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        {rawError && <Alert className='mb-2 shrink-0' type='error' showIcon message={rawError} />}
        <div className='flex min-h-0 flex-1 flex-col'>
          {rawLoading ? (
            <div className='flex flex-1 items-center justify-center gap-2'>
              <Spin size='small' />
              <span>Loading raw message</span>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    );
  },
);

ContentMessageRaw.displayName = 'ContentMessageRaw';

export default ContentMessageRaw;
