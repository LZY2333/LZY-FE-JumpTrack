import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Space, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ISchema } from '@formily/react';
import type { MessageDetail } from '@/types';
import { BUSINESS_STATUS_LABELS, MESSAGE_DIRECTION_LABELS, TRANSMISSION_STATUS_LABELS } from '@/types/enums';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import useMessageDetail from './useMessageDetail';
import TabProcessing from './TabProcessing';
import TabRaw from './TabRaw';
import { RoutePath } from '@/router/paths';
import { getMessageSchema, messageBasicInfoSchema } from '@/schemas/messages';
import { toMessageBasicFormData } from '@/utils/messageUtil';
import { getBusinessStatusColor, getTransmissionStatusColor } from '@/components/TableColumn/message';
import { resolveDisplayMessageId, resolveLabel } from './util';

const TAB_CONTENT_CLASS_NAME = 'h-full overflow-auto';

/** 报文明细页：展示报文基础信息、结构化业务内容、原始报文和处理记录。 */
const MessageDetailPage = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const { detail, detailError } = useMessageDetail(messageId);
  const schema = getMessageSchema(detail?.msgType);

  const tabs = [
    {
      key: 'structured',
      label: '结构化内容',
      className: TAB_CONTENT_CLASS_NAME,
      children: <StructuredContent schema={schema} detail={detail} />,
    },
    {
      key: 'raw',
      label: '报文原文',
      className: TAB_CONTENT_CLASS_NAME,
      children: <TabRaw messageId={messageId} />,
    },
    {
      key: 'processing',
      label: '处理记录',
      className: TAB_CONTENT_CLASS_NAME,
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
        <MessageStatusTags detail={detail} />
      </Space>

      {detailError && <Alert className='mb-3 shrink-0' type='error' showIcon message={detailError} />}
      <div className='shrink-0'>
        <MessageSchemaForm schema={messageBasicInfoSchema} values={detail ? toMessageBasicFormData(detail) : {}} />
      </div>
      <Tabs
        className='mt-2 min-h-0 flex-1 overflow-hidden [&>.ant-tabs-content-holder>.ant-tabs-content]:h-full [&>.ant-tabs-content-holder]:overflow-hidden'
        size='small'
        tabBarGutter={20}
        items={tabs}
      />
    </div>
  );
};

export default MessageDetailPage;

/** 结构化内容 Tab：按报文类型展示支付、账户或状态报告等业务字段。 */
const StructuredContent = ({ schema, detail }: { schema?: ISchema; detail: MessageDetail | null }) => {
  if (!schema) {
    return <Alert type='info' showIcon message='当前报文类型暂无结构化模板，可查看或下载原始报文。' />;
  }
  return <MessageSchemaForm schema={schema} values={detail?.formData ?? {}} />;
};

/** 报文状态标签：展示报文收发方向、收发状态和业务处理状态。 */
const MessageStatusTags = ({ detail }: { detail: MessageDetail | null }) => {
  if (!detail) return null;

  return (
    <>
      <Tag>{resolveLabel(MESSAGE_DIRECTION_LABELS, detail.msgDirection)}</Tag>
      <Tag color={getTransmissionStatusColor(detail.transmissionStatus)}>
        {resolveLabel(TRANSMISSION_STATUS_LABELS, detail.transmissionStatus)}
      </Tag>
      <Tag color={getBusinessStatusColor(detail.businessStatus)}>
        {resolveLabel(BUSINESS_STATUS_LABELS, detail.businessStatus)}
      </Tag>
    </>
  );
};
