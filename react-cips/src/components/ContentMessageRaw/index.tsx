import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Alert, App, Empty, Spin } from 'antd';
import RawList from './RawList';
import RawSingle from './RawSingle';
import type { RawSingleRef } from './RawSingle';
import useRaws from './useRaws';
import useRawActions from './useRawActions';

/** 原文展示模式，列表不允许编辑 */
export type ContentMessageRawProps = {
  /** 报文标识 */
  msgId?: string;
} & (
  | {
      /** 默认以列表展示当前及关联报文 */
      mode?: 'list';
      /** 列表仅支持只读 */
      editable?: false;
    }
  | {
      /** 只展示首条当前报文 */
      mode: 'single';
      /** 是否允许编辑当前报文 */
      editable?: boolean;
    }
);

/** 当前报文的外部操作接口 */
export type ContentMessageRawRef = RawSingleRef;

/** 查询原文并分发至列表或单条视图，外部操作始终定位首条报文 */
const RawContent = forwardRef<ContentMessageRawRef, ContentMessageRawProps>(
  ({ msgId, mode = 'list', editable = false }, forwardedRef) => {
    const { message } = App.useApp();
    const currentSingleRef = useRef<RawSingleRef>(null);
    const { raws, rawLoading, rawError } = useRaws(msgId);
    const currentRaw = raws[0];
    const fallbackActions = useRawActions({
      msgId: currentRaw?.msgId ?? msgId,
      content: currentRaw?.msgContent ?? '',
      loading: rawLoading,
    });

    useImperativeHandle(forwardedRef, () => ({
      copyCurrent: () => (currentSingleRef.current ?? fallbackActions).copyCurrent(),
      printCurrent: () => (currentSingleRef.current ?? fallbackActions).printCurrent(),
      getUpdatedContent: () => {
        if (currentSingleRef.current) return currentSingleRef.current.getUpdatedContent();
        message.warning(rawLoading ? 'Raw message is still loading' : 'Raw message is unavailable');
        return undefined;
      },
      resetCurrent: () => {
        if (currentSingleRef.current) {
          currentSingleRef.current.resetCurrent();
          return;
        }
        message.warning(rawLoading ? 'Raw message is still loading' : 'Raw message is unavailable');
      },
    }));

    /** 根据加载状态和展示模式渲染原文区域 */
    const renderContent = () => {
      if (rawLoading) {
        return (
          <div className='flex flex-1 items-center justify-center gap-2'>
            <Spin size='small' />
            <span>Loading raw messages</span>
          </div>
        );
      }
      if (mode === 'list') return <RawList raws={raws} currentSingleRef={currentSingleRef} />;
      if (!currentRaw) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No raw message' />;
      return <RawSingle ref={currentSingleRef} raw={currentRaw} editable={editable} />;
    };

    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        {rawError && <Alert className='mb-2 shrink-0' type='error' showIcon message={rawError} />}
        {renderContent()}
      </div>
    );
  },
);

RawContent.displayName = 'RawContent';

/** 切换报文时同步重置请求、编辑和展开状态，避免使用上一条报文的数据 */
const ContentMessageRaw = forwardRef<ContentMessageRawRef, ContentMessageRawProps>((props, forwardedRef) => (
  <RawContent key={props.msgId} {...props} ref={forwardedRef} />
));

ContentMessageRaw.displayName = 'ContentMessageRaw';

export default ContentMessageRaw;
