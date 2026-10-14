import { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Button, Card, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CommentOutlined, CopyOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import { CardMessageBasicInfo } from '@/components/MessageInfo/CardMessageBasicInfo';
import { ContentMessageBusinessInfo } from '@/components/MessageInfo/CardMessageBusinessInfo';
import { resolveDisplayMessageId } from '@/components/MessageInfo/messageDetailUtil';
import useMessageDetail from '@/components/MessageInfo/useMessageDetail';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import useUserStore from '@/store/useUserStore';
import { MessageDirection } from '@/types/enums';
import { openModalInquiryReply } from '@/pages/iop-inquiry-reply/ModalInquiryReply';
import { openModalDistribute } from './ModalIopTask';
import TabProcessing from './TabProcessing';
import { RoutePath } from '@/router/routePath';

const SCROLLABLE_TAB_CONTENT_CLASS_NAME = 'h-full overflow-auto';
const FLEX_TAB_CONTENT_CLASS_NAME = 'flex h-full min-h-0 flex-col overflow-hidden';
const DEFAULT_TAB_KEY = 'structured';
const RAW_TAB_KEY = 'raw';

/** 报文明细页：展示报文基础信息、结构化业务内容、原始报文和处理记录。 */
const MessageDetailPage = () => {
  const { message, modal } = App.useApp();
  const user = useUserStore((state) => state.user);
  const { msgId } = useParams<{ msgId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { detail, detailError } = useMessageDetail({ msgId });
  const msgDirection = detail?.msgBasicInfo.msgDirection;
  const messageRawRef = useRef<ContentMessageRawRef>(null);

  /** 【Distribute】 */
  const handleCreateDistribution = async () => {
    if (!user) {
      message.warning('Please log in first.');
      return;
    }
    if (!msgId) {
      message.warning('Message information is unavailable.');
      return;
    }

    const created = await openModalDistribute(modal, { msgId, userId: user.userId, orgId: user.orgId });
    if (created) message.success('Distribution task created');
  };

  /** 【Inquiry Reply】 */
  const handleCreateInquiryReply = async () => {
    if (!user) {
      message.warning('Please log in first.');
      return;
    }
    if (!msgId) {
      message.warning('Message information is unavailable.');
      return;
    }

    const created = await openModalInquiryReply(modal, {
      msgId,
      userId: user.userId,
      orgId: user.orgId,
      sourceMessage: detail?.msgBasicInfo ?? null,
      sourceMainMsgId: detail?.msgBasicInfo.mainMsgId,
      sourceMsgRelatedId: detail?.msgBasicInfo.msgRelatedId,
    });
    if (created) message.success('Inquiry reply task created');
  };

  /** 【Print】 */
  const handlePrint = () => {
    if (!user) {
      message.warning('Please log in first.');
      return;
    }
    messageRawRef.current!.printCurrent();
  };
  /** 【Copy】 */
  const handleCopyRaw = async () => {
    if (!user) {
      message.warning('Please log in first.');
      return;
    }
    await messageRawRef.current!.copyCurrent();
  };
  /** 【Back】 */
  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    navigate({ pathname: RoutePath.MessageList, search: location.search }, { replace: true });
  };

  const tabs = [
    {
      key: 'structured',
      label: 'Business Info',
      className: SCROLLABLE_TAB_CONTENT_CLASS_NAME,
      children: <ContentMessageBusinessInfo detail={detail} />,
    },
    {
      key: RAW_TAB_KEY,
      label: 'Raw Message',
      className: FLEX_TAB_CONTENT_CLASS_NAME,
      forceRender: true,
      children: <ContentMessageRaw ref={messageRawRef} msgId={msgId} msgDirection={msgDirection} />,
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
          {msgDirection === MessageDirection.In && (
            <Button size='small' type='primary' icon={<PlusOutlined />} onClick={handleCreateDistribution}>
              Distribute
            </Button>
          )}
          <Button size='small' type='primary' icon={<CommentOutlined />} onClick={handleCreateInquiryReply}>
            Inquiry Reply
          </Button>
          <Button size='small' icon={<CopyOutlined />} onClick={handleCopyRaw}>
            Copy Raw
          </Button>
          <Button size='small' icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Raw
          </Button>
        </Space>
      </div>

      {detailError && <Alert className='mb-3 shrink-0' type='error' showIcon message={detailError} />}
      <CardMessageBasicInfo className='shrink-0' detail={detail} />
      <Card
        className='mt-3 flex min-h-0 flex-1 flex-col'
        classNames={{ body: 'min-h-0 flex-1 overflow-hidden' }}
        size='small'
      >
        <Tabs
          className='flex h-full min-h-0 flex-col overflow-hidden [&_.ant-tabs-tab-btn]:font-semibold [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-hidden'
          size='small'
          tabBarGutter={20}
          defaultActiveKey={DEFAULT_TAB_KEY}
          items={tabs}
        />
      </Card>
    </div>
  );
};

export default MessageDetailPage;

/** 判断当前报文是否支持创建查询查复任务 */
/*
const isInquiryReplyAvailable = (msgDirection?: string, businessType?: string) =>
  (msgDirection === MessageDirection.In && businessType === MessageBusinessType.Query) ||
  (msgDirection === MessageDirection.Out && businessType === MessageBusinessType.Payment);
*/
