import { Alert, Card, Modal, Spin } from 'antd';
import type { MessageDetail } from '@/types';
import { MessageBusinessType } from '@/types/enums';
import type { MessageDirection } from '@/types/enums';
import CardCollapse from '@/components/CardCollapse';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { getMessageSchema, messageBasicInfoSchema } from '@/schemas/messages';
import useMessageDetail from './useMessageDetail';
import { resolveDisplayMessageId, toMessageBasicFormData } from './util';

interface ModalMessageRelatedProps {
  /** 要展示的关联报文标识号。 */
  messageId: string;
  /** 关联报文收发方向。 */
  msgDirection: MessageDirection;
  /** 关联报文业务类型。 */
  businessType: MessageBusinessType;
  /** 控制弹窗显示状态。 */
  open: boolean;
  /** 关闭弹窗并清理当前选择。 */
  onClose: () => void;
}

interface MessageBasicInfoPanelProps {
  /** 当前报文明细；请求完成前允许为空。 */
  detail: MessageDetail | null;
  /** 调用方用于参与页面布局的样式类。 */
  className?: string;
}

interface MessageBusinessContentProps {
  /** 当前报文明细；用于选择业务 Schema 并填充字段。 */
  detail: MessageDetail | null;
}

interface MessageBusinessInfoPanelProps extends MessageBusinessContentProps {
  /** 调用方用于参与页面布局的样式类。 */
  className?: string;
}

/** 关联报文简化明细弹窗：展示基础信息和结构化业务信息。 */
const ModalMessageRelated = ({ messageId, msgDirection, businessType, open, onClose }: ModalMessageRelatedProps) => {
  const { detail, detailError } = useMessageDetail(messageId, msgDirection, businessType);

  return (
    <Modal
      centered
      destroyOnHidden
      footer={null}
      open={open}
      title={`Related Message ${resolveDisplayMessageId(detail, messageId)}`}
      width={1200}
      onCancel={onClose}
    >
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      {!detail && !detailError ? (
        <div className='flex min-h-40 items-center justify-center'>
          <Spin size='small' tip='Loading related message' />
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          <MessageBasicInfoPanel detail={detail} />
          <MessageBusinessInfoPanel detail={detail} />
        </div>
      )}
    </Modal>
  );
};

/** Basic Info Card */
export const MessageBasicInfoPanel = ({ detail, className }: MessageBasicInfoPanelProps) => (
  <CardCollapse className={className} size='small' title='Basic Info'>
    <MessageSchemaForm
      schema={messageBasicInfoSchema}
      values={detail ? toMessageBasicFormData(detail.msgBasicInfo) : {}}
      pattern='disabled'
    />
  </CardCollapse>
);

/** Business Info Card */
export const MessageBusinessInfoPanel = ({ detail, className }: MessageBusinessInfoPanelProps) => (
  <Card className={className} size='small' title='Business Info'>
    <MessageBusinessContent detail={detail} />
  </Card>
);

/** Business Info Card Content */
export const MessageBusinessContent = ({ detail }: MessageBusinessContentProps) => {
  if (detail?.msgBasicInfo.businessType === MessageBusinessType.Other) {
    return (
      <Alert
        type='info'
        showIcon
        message='No structured business information for Other messages. The raw message remains available.'
      />
    );
  }
  const schema = getMessageSchema(detail?.msgBasicInfo.businessType);
  if (!schema) {
    return (
      <Alert
        type='info'
        showIcon
        message='No business information template is available for this business type. View or download the raw message instead.'
      />
    );
  }
  return <MessageSchemaForm schema={schema} values={detail ? { ...detail } : {}} pattern='disabled' />;
};

export default ModalMessageRelated;
