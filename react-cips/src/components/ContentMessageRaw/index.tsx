import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Alert, Empty, Spin } from 'antd';
import type { MessageRaw } from '@/api/messages';
import CodeMirrorXML from '@/components/CodeMirrorXML';
import type { CodeMirrorXMLRef } from '@/components/CodeMirrorXML';

interface ContentMessageRawBaseProps {
  /** Raw Message 数据。 */
  raw: MessageRaw | null;
  /** Raw Message 是否正在加载。 */
  loading: boolean;
  /** Raw Message 加载错误。 */
  error?: string;
}

interface ContentMessageRawEditableProps extends ContentMessageRawBaseProps {
  /** 启用编辑模式。 */
  editable: true;
  /** Raw Message 原文变更回调。 */
  onChange: (value: string) => void;
}

interface ContentMessageRawReadOnlyProps extends ContentMessageRawBaseProps {
  /** 使用默认的只读模式。 */
  editable?: false;
  /** 只读模式不允许传入变更回调。 */
  onChange?: never;
}

export type ContentMessageRawProps = ContentMessageRawEditableProps | ContentMessageRawReadOnlyProps;

export interface ContentMessageRawRef {
  /** 获取包含当前折叠状态的打印内容。 */
  getPrintableValue: () => string;
}

/** 展示或编辑 Raw Message，并统一处理加载、错误和空状态。 */
const ContentMessageRaw = forwardRef<ContentMessageRawRef, ContentMessageRawProps>((props, forwardedRef) => {
  const { raw, loading, error } = props;
  const codeMirrorXMLRef = useRef<CodeMirrorXMLRef>(null);

  useImperativeHandle(
    forwardedRef,
    () => ({
      getPrintableValue: () => codeMirrorXMLRef.current?.getPrintableValue() ?? raw?.msgContent ?? '',
    }),
    [raw?.msgContent],
  );

  let content = (
    <div className='flex flex-1 items-center justify-center'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No raw message' />
    </div>
  );
  if (props.editable) {
    content = (
      <CodeMirrorXML
        ref={codeMirrorXMLRef}
        className='min-h-0 flex-1'
        value={raw?.msgContent ?? ''}
        onChange={props.onChange}
      />
    );
  } else if (raw?.msgContent) {
    content = <CodeMirrorXML ref={codeMirrorXMLRef} className='min-h-0 flex-1' value={raw.msgContent} readOnly />;
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <div className='flex min-h-0 flex-1 flex-col'>
        {loading ? (
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
});

ContentMessageRaw.displayName = 'ContentMessageRaw';

export default ContentMessageRaw;
