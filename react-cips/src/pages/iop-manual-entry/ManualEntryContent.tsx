import { forwardRef } from 'react';
import { Alert, Card, Result, Tabs } from 'antd';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import { CardMessageBasicInfo } from '@/components/MessageInfo/CardMessageBasicInfo';
import { CardMessageBusinessInfo } from '@/components/MessageInfo/CardMessageBusinessInfo';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';
import type { ManualEntryState } from './useManualEntry';

const DETAIL_TAB_KEY = 'detail';

/** 手工补录内容区。 */
const ManualEntryContent = forwardRef<ContentMessageRawRef, ManualEntryContentProps>(
  ({ taskNode, manualEntry }, messageRawRef) => {
    if (!manualEntry.makerMode && !manualEntry.checkerMode) {
      return (
        <Result
          status='warning'
          title='Unsupported task node'
          subTitle={IOP_TASK_NODE_LABELS[taskNode as IopTaskNode] ?? taskNode}
        />
      );
    }

    if (manualEntry.makerMode) {
      const editableProps = manualEntry.updated
        ? {}
        : { editable: true as const, onChange: manualEntry.setCurrentRaw };
      const rawContent = (
        <ContentMessageRaw
          ref={messageRawRef}
          raw={manualEntry.currentRawMessage}
          loading={manualEntry.rawLoading}
          error={manualEntry.rawError}
          {...editableProps}
        />
      );

      if (!manualEntry.updated) {
        return (
          <Card
            className='flex h-full min-h-0 flex-col'
            classNames={{ body: 'flex min-h-0 flex-1 flex-col overflow-hidden' }}
            size='small'
            title='Raw Message'
          >
            {rawContent}
          </Card>
        );
      }

      const items = [
        {
          key: DETAIL_TAB_KEY,
          label: 'Detail',
          className: 'h-full overflow-auto',
          children: <MessageDetail manualEntry={manualEntry} />,
        },
        {
          key: 'raw',
          label: 'Raw Message',
          className: 'flex h-full min-h-0 flex-col overflow-hidden',
          children: rawContent,
        },
      ];

      return (
        <Tabs
          className='flex h-full min-h-0 flex-col overflow-hidden [&_.ant-tabs-tab-btn]:font-semibold [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-hidden'
          size='small'
          defaultActiveKey={DETAIL_TAB_KEY}
          items={items}
        />
      );
    }

    /** Checker节点 */
    return <MessageDetail manualEntry={manualEntry} />;
  },
);

ManualEntryContent.displayName = 'ManualEntryContent';

/** 解析后的报文明细。 */
const MessageDetail = ({ manualEntry }: ContentProps) => (
  <div className='h-full overflow-auto'>
    {manualEntry.detailError && <Alert className='mb-3' type='error' showIcon message={manualEntry.detailError} />}
    <CardMessageBasicInfo detail={manualEntry.detail} />
    <CardMessageBusinessInfo className='mt-3' detail={manualEntry.detail} />
  </div>
);

interface ManualEntryContentProps {
  /** 当前 Task 节点。 */
  taskNode: string;
  /** 页面业务状态。 */
  manualEntry: ManualEntryState;
}

interface ContentProps {
  /** 页面业务状态。 */
  manualEntry: ManualEntryState;
}

export default ManualEntryContent;
