import { forwardRef } from 'react';
import { Alert, Empty, Spin } from 'antd';
import XMLViewer from '@/components/XMLViewer';
import type { MessageRaw } from '@/types';

interface TabRawProps {
  /** 当前报文原文。 */
  raw: MessageRaw | null;
  /** 原文是否正在加载。 */
  loading: boolean;
  /** 原文加载错误。 */
  error?: string;
}

/** 报文原文 Tab：展示报文系统接收或发送的原始 XML。 */
const TabRaw = forwardRef<HTMLDivElement, TabRawProps>(({ raw, loading, error }, viewerContentRef) => {
  const content = raw?.content ? (
    <XMLViewer ref={viewerContentRef} className='min-h-0 flex-1 text-xs' xml={raw.content} />
  ) : (
    <div className='flex flex-1 items-center justify-center'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No raw message' />
    </div>
  );

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

TabRaw.displayName = 'TabRaw';

export default TabRaw;
