import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { MessageDetail } from '@/types';
import { BUSINESS_STATUS_LABELS, MESSAGE_DIRECTION_LABELS, TRANSMISSION_STATUS_LABELS } from '@/types/enums';
import useMessageDetail from './useMessageDetail';
import TabProcessing from './TabProcessing';
import TabRelatedMessages from './TabRelatedMessages';
import TabRaw from './TabRaw';
import { RoutePath } from '@/router/paths';
import { MessageBasicInfoPanel, MessageBusinessContent } from './messageDetailContent';
import { resolveDisplayMessageId, resolveLabel } from './util';

const SCROLLABLE_TAB_CONTENT_CLASS_NAME = 'h-full overflow-auto';
const FLEX_TAB_CONTENT_CLASS_NAME = 'flex h-full min-h-0 flex-col overflow-hidden';

interface MessageStatusTextProps {
  /** 当前报文明细；请求完成前不展示状态摘要。 */
  detail: MessageDetail | null;
}

/** 报文明细页：展示报文基础信息、结构化业务内容、原始报文和处理记录。 */
const MessageDetailPage = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const { detail, detailError } = useMessageDetail(messageId);

  const tabs = [
    {
      key: 'structured',
      label: '业务信息',
      className: SCROLLABLE_TAB_CONTENT_CLASS_NAME,
      children: <MessageBusinessContent detail={detail} />,
    },
    {
      key: 'raw',
      label: '报文原文',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      children: <TabRaw messageId={messageId} />,
    },
    {
      key: 'related',
      label: '关联报文',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      children: <TabRelatedMessages messageId={messageId} />,
    },
    {
      key: 'processing',
      label: '处理记录',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      children: <TabProcessing messageId={messageId} />,
    },
  ];

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <Space className='mb-3 shrink-0' size={8} wrap>
        <Button
          size='small'
          color='primary'
          variant='solid'
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(RoutePath.MessageList)}
        >
          返回
        </Button>
        <Typography.Text strong>报文 {resolveDisplayMessageId(detail, messageId)}</Typography.Text>
        <MessageStatusText detail={detail} />
      </Space>

      {detailError && <Alert className='mb-3 shrink-0' type='error' showIcon message={detailError} />}
      <MessageBasicInfoPanel className='shrink-0' detail={detail} />
      <Card
        className='mt-3 flex min-h-0 flex-1 flex-col'
        classNames={{ body: 'min-h-0 flex-1 overflow-hidden' }}
        size='small'
      >
        <Tabs
          className='flex h-full min-h-0 flex-col overflow-hidden [&_.ant-tabs-tab-btn]:font-semibold [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-hidden'
          size='small'
          tabBarGutter={20}
          items={tabs}
        />
      </Card>
    </div>
  );
};

export default MessageDetailPage;

/** 报文状态摘要：直接展示收发方向、收发状态和业务处理状态文字。 */
const MessageStatusText = ({ detail }: MessageStatusTextProps) => {
  if (!detail) return null;

  return (
    <Space size={16} wrap>
      <Typography.Text>收发标志：{resolveLabel(MESSAGE_DIRECTION_LABELS, detail.msgDirection)}</Typography.Text>
      <Typography.Text>收发状态：{resolveLabel(TRANSMISSION_STATUS_LABELS, detail.transmissionStatus)}</Typography.Text>
      <Typography.Text>业务状态：{resolveLabel(BUSINESS_STATUS_LABELS, detail.businessStatus)}</Typography.Text>
    </Space>
  );
};
