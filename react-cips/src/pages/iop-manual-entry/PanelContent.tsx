import { forwardRef } from 'react';
import { Card, Result, Tabs } from 'antd';
import type { MessageRaw } from '@/api/messages';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

const DETAIL_TAB_KEY = 'detail';

/** IOP手工补录内容 */
const PanelContent = forwardRef<ContentMessageRawRef, PanelContentProps>(
  (
    {
      taskNode,
      isMakerNode,
      isCheckerNode,
      updated,
      msgId,
      msgDirection,
      businessType,
      currentRawMessage,
      rawLoading,
      rawError,
      onRawChange,
    },
    messageRawRef,
  ) => {
    /** 节点错误 */
    if (!isMakerNode && !isCheckerNode) {
      return (
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[taskNode as IopTaskNode] ?? taskNode}`}
        />
      );
    }

    if (isMakerNode) {
      const editableProps = updated ? {} : { editable: true as const, onChange: onRawChange };
      const rawContent = (
        <ContentMessageRaw
          ref={messageRawRef}
          raw={currentRawMessage}
          loading={rawLoading}
          error={rawError}
          {...editableProps}
        />
      );

      if (!updated) {
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
          children: <PanelMessageDetail temp msgId={msgId} msgDirection={msgDirection} businessType={businessType} />,
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
    return <PanelMessageDetail temp msgId={msgId} msgDirection={msgDirection} businessType={businessType} />;
  },
);

PanelContent.displayName = 'PanelContent';

interface PanelContentProps {
  /** 当前 Task 节点。 */
  taskNode: string;
  /** 是否展示 Maker 内容。 */
  isMakerNode: boolean;
  /** 是否展示 Checker 1 内容。 */
  isCheckerNode: boolean;
  /** Maker 是否已完成 Update。 */
  updated: boolean;
  /** 报文 ID。 */
  msgId?: string;
  /** 报文方向。 */
  msgDirection?: string;
  /** 业务类型。 */
  businessType?: string;
  /** 当前原文对象。 */
  currentRawMessage: MessageRaw;
  /** 原文是否正在加载。 */
  rawLoading: boolean;
  /** 原文加载错误。 */
  rawError?: string;
  /** 更新当前原文。 */
  onRawChange: (value: string) => void;
}

export default PanelContent;
