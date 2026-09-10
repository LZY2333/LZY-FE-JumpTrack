import { forwardRef } from 'react';
import { Alert, Empty, Spin } from 'antd';
import type { MessageRaw } from '@/types';
import XMLViewer from './index';

interface RawViewerProps {
  /** Raw Message data. */
  raw: MessageRaw | null;
  /** Whether Raw Message is loading. */
  loading: boolean;
  /** Raw Message loading error. */
  error?: string;
}

/** Raw Message Viewer */
const RawViewer = forwardRef<HTMLDivElement, RawViewerProps>(({ raw, loading, error }, viewerContentRef) => {
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

RawViewer.displayName = 'RawViewer';

export default RawViewer;
