import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Button, Card, Space, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CommentOutlined, CopyOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import { postDCCreate, postIRCreate } from '@/api/iop';
import { CardMessageBasicInfo } from '@/components/MessageInfo/CardMessageBasicInfo';
import { ContentMessageBusinessInfo } from '@/components/MessageInfo/CardMessageBusinessInfo';
import { resolveDisplayMessageId } from '@/components/MessageInfo/messageDetailUtil';
import useMessageDetail from '@/components/MessageInfo/useMessageDetail';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import useUserStore from '@/store/useUserStore';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { MessageBusinessType, MessageDirection } from '@/types/enums';
import { openModalDistribute, openModalInquiryReply } from './ModalIopTask';
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
  const { detail, detailError } = useMessageDetail({ msgId });
  const msgDirection = detail?.msgBasicInfo.msgDirection;
  const businessType = detail?.msgBasicInfo.businessType;
  const messageRawRef = useRef<ContentMessageRawRef>(null);

  /** 【Distribute】 */
  const handleCreateDistribution = async () => {
    if (!msgId || !user) {
      message.warning('Message or current user information is unavailable');
      return;
    }

    const fields = await openModalDistribute(modal);
    if (!fields) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDCCreate({
        msgId,
        userId: user.userId,
        orgId: user.orgId,
        targeSysId: normalizeOptionalText(fields.targeSysId),
        msgOwnerDept: normalizeOptionalText(fields.msgOwnerDept),
        msgOwnerGroup: normalizeOptionalText(fields.msgOwnerGroup),
      });
      message.success('Distribution task created');
    } finally {
      stopGlobalLoading();
    }
  };

  /** 【Inquiry Reply】 */
  const handleCreateInquiryReply = async () => {
    if (!msgId || !user) {
      message.warning('Message or current user information is unavailable');
      return;
    }

    const fields = await openModalInquiryReply(modal);
    if (!fields) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postIRCreate({
        msgId,
        userId: user.userId,
        orgId: user.orgId,
        busData: {
          msgType: fields.msgType,
          content: fields.content.trim(),
        },
      });
      message.success('Inquiry reply task created');
    } finally {
      stopGlobalLoading();
    }
  };

  /** 【Print】 */
  const handlePrint = () => {
    messageRawRef.current!.printCurrent();
  };
  /** 【Copy】 */
  const handleCopyRaw = async () => {
    await messageRawRef.current!.copyCurrent();
  };
  /** 【Back】 */
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
            <Button
              size='small'
              type='primary'
              icon={<PlusOutlined />}
              disabled={!user}
              onClick={handleCreateDistribution}
            >
              Distribute
            </Button>
          )}
          {isInquiryReplyAvailable(msgDirection, businessType) && (
            <Button
              size='small'
              type='primary'
              icon={<CommentOutlined />}
              disabled={!user}
              onClick={handleCreateInquiryReply}
            >
              Inquiry Reply
            </Button>
          )}
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

/** 将可选文本统一转换为接口空值。 */
const normalizeOptionalText = (value?: string) => value?.trim() || undefined;

/** 判断当前报文是否支持创建查询查复任务。 */
const isInquiryReplyAvailable = (msgDirection?: string, businessType?: string) =>
  (msgDirection === MessageDirection.In && businessType === MessageBusinessType.Query) ||
  (msgDirection === MessageDirection.Out && businessType === MessageBusinessType.Payment);
