import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Button, Card, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CopyOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { downloadMessage } from '@/api/messages';
import useMessageDetail from './useMessageDetail';
import useMessageRaw from './useMessageRaw';
import TabProcessing from './TabProcessing';
import TabRelatedMessages from './TabRelatedMessages';
import TabRaw from './TabRaw';
import { RoutePath } from '@/router/paths';
import { MessageBasicInfoPanel, MessageBusinessContent } from './ModalMessageRelated';
import { isRawContentActionDisabled, printTextDocument, resolveDisplayMessageId } from './util';
import { copyText, saveBlobResponse } from '@/utils/fileUtil';

const SCROLLABLE_TAB_CONTENT_CLASS_NAME = 'h-full overflow-auto';
const FLEX_TAB_CONTENT_CLASS_NAME = 'flex h-full min-h-0 flex-col overflow-hidden';

/** 报文明细页：展示报文基础信息、结构化业务内容、原始报文和处理记录。 */
const MessageDetailPage = () => {
  const { message } = App.useApp();
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const { detail, detailError } = useMessageDetail(messageId);
  const { raw, rawLoading, rawError } = useMessageRaw(messageId);
  const [downloading, setDownloading] = useState(false);

  /** 复制当前报文原文。 */
  const handleCopy = () => {
    if (!raw?.content) return;
    copyText(raw.content)
      .then(() => message.success('原文已复制'))
      .catch(() => message.error('复制失败'));
  };

  /** 打开只包含当前报文原文的打印窗口。 */
  const handlePrint = () => {
    if (!raw?.content) return;
    const opened = printTextDocument(raw.fileName || `${messageId || 'message'}.xml`, raw.content);
    if (!opened) message.error('打印窗口被浏览器拦截，请允许弹出窗口后重试');
  };

  /** 下载当前报文原始文件。 */
  const handleDownload = () => {
    if (!messageId || downloading) return;
    setDownloading(true);
    downloadMessage(messageId)
      .then((response) => saveBlobResponse(response, raw?.fileName || `${messageId}.xml`))
      .finally(() => setDownloading(false));
  };

  const rawContentActionDisabled = isRawContentActionDisabled(raw, rawLoading);

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
      children: <TabRaw raw={raw} loading={rawLoading} error={rawError} />,
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
      <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
        <Space size={8} wrap>
          <Button
            size='small'
            color='primary'
            variant='solid'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(RoutePath.MessageList)}
          >
            返回
          </Button>
          <Typography.Text strong>报文 {resolveDisplayMessageId(detail, messageId)} 详情</Typography.Text>
        </Space>
        <Space size={8} wrap>
          <Button size='small' icon={<CopyOutlined />} disabled={rawContentActionDisabled} onClick={handleCopy}>
            复制原文
          </Button>
          <Button size='small' icon={<PrinterOutlined />} disabled={rawContentActionDisabled} onClick={handlePrint}>
            打印原文
          </Button>
          <Button
            size='small'
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={!messageId}
            onClick={handleDownload}
          >
            下载原文
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
          items={tabs}
        />
      </Card>
    </div>
  );
};

export default MessageDetailPage;
