import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Button, Card, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CopyOutlined, PrinterOutlined } from '@ant-design/icons';
import useMessageDetail from './useMessageDetail';
import useMessageRaw from './useMessageRaw';
import TabProcessing from './TabProcessing';
import TabRaw from './TabRaw';
import { RoutePath } from '@/router/paths';
import { MessageBasicInfoPanel, MessageBusinessContent } from './ModalMessageRelated';
import { isRawContentActionDisabled, printElementDocument, printTextDocument, resolveDisplayMessageId } from './util';
import { copyText } from '@/utils/fileUtil';

const SCROLLABLE_TAB_CONTENT_CLASS_NAME = 'h-full overflow-auto';
const FLEX_TAB_CONTENT_CLASS_NAME = 'flex h-full min-h-0 flex-col overflow-hidden';
const DEFAULT_TAB_KEY = 'structured';
const RAW_TAB_KEY = 'raw';

/** 报文明细页：展示报文基础信息、结构化业务内容、原始报文和处理记录。 */
const MessageDetailPage = () => {
  const { message } = App.useApp();
  const { msgId, msgDirection, businessType } = useParams<{
    msgId: string;
    msgDirection: string;
    businessType: string;
  }>();
  const navigate = useNavigate();
  const { detail, detailError } = useMessageDetail(msgId, msgDirection, businessType);
  const { raw, rawLoading, rawError } = useMessageRaw(msgId);
  const [activeTabKey, setActiveTabKey] = useState(DEFAULT_TAB_KEY);
  const rawViewerContentRef = useRef<HTMLDivElement>(null);

  /** 打开只包含当前报文原文的打印窗口。 */
  const handlePrint = () => {
    if (!raw?.content) return;
    const title = raw.fileName || `${msgId || 'message'}.xml`;
    const currentViewElement = activeTabKey === RAW_TAB_KEY ? rawViewerContentRef.current : null;
    const opened = currentViewElement
      ? printElementDocument(title, currentViewElement)
      : printTextDocument(title, raw.content);
    if (!opened) message.error('The print window was blocked. Allow pop-ups and try again.');
  };

  const rawContentActionDisabled = isRawContentActionDisabled(raw, rawLoading);

  const handleCopyRaw = async () => {
    if (!raw?.content) return;
    try {
      await copyText(raw.content);
      message.success('Raw message copied');
    } catch {
      message.error('Failed to copy the raw message');
    }
  };

  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    navigate(RoutePath.MessageList, { replace: true });
  };

  const tabs = [
    {
      key: 'structured',
      label: 'Business Information',
      className: SCROLLABLE_TAB_CONTENT_CLASS_NAME,
      children: <MessageBusinessContent detail={detail} />,
    },
    {
      key: RAW_TAB_KEY,
      label: 'Raw Message',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      children: <TabRaw ref={rawViewerContentRef} raw={raw} loading={rawLoading} error={rawError} />,
    },
    {
      key: 'processing',
      label: 'Processing History',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      children: <TabProcessing messageId={msgId} />,
    },
  ];

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
        <Space size={8} wrap>
          <Button size='small' color='primary' variant='solid' icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
          <Typography.Text strong>Message {resolveDisplayMessageId(detail, msgId)} Details</Typography.Text>
        </Space>
        <Space size={8} wrap>
          <Button size='small' icon={<CopyOutlined />} disabled={rawContentActionDisabled} onClick={handleCopyRaw}>
            Copy Raw
          </Button>
          <Button size='small' icon={<PrinterOutlined />} disabled={rawContentActionDisabled} onClick={handlePrint}>
            Print Raw
          </Button>
        </Space>
      </div>

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
          activeKey={activeTabKey}
          items={tabs}
          onChange={setActiveTabKey}
        />
      </Card>
    </div>
  );
};

export default MessageDetailPage;
