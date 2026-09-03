import { Alert, Card, Modal, Spin } from 'antd';
import type { MessageDetail } from '@/types';
import { MessageBusinessType } from '@/types/enums';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { getMessageSchema, messageBasicInfoSchema } from '@/schemas/messages';
import useMessageDetail from './useMessageDetail';
import { resolveDisplayMessageId, toMessageBasicFormData } from './util';

interface ModalMessageRelatedProps {
  /** 要展示的关联报文标识号。 */
  messageId: string;
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
const ModalMessageRelated = ({ messageId, open, onClose }: ModalMessageRelatedProps) => {
  const { detail, detailError } = useMessageDetail(messageId);

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

/** 基础信息面板：使用禁用 Input 保留表单形态和字段边界。 */
export const MessageBasicInfoPanel = ({ detail, className }: MessageBasicInfoPanelProps) => (
  <Card className={className} size='small' title='Basic Information'>
    <MessageSchemaForm
      schema={messageBasicInfoSchema}
      values={detail ? toMessageBasicFormData(detail) : {}}
      pattern='disabled'
    />
  </Card>
);

/** 业务信息面板：供弹窗等无 Tab 容器的简化明细复用。 */
export const MessageBusinessInfoPanel = ({ detail, className }: MessageBusinessInfoPanelProps) => (
  <Card className={className} size='small' title='Business Information'>
    <MessageBusinessContent detail={detail} />
  </Card>
);

/** 业务信息内容：按 BUSINESS_TYPE 选择对应类型信息表和属性表 Schema。 */
export const MessageBusinessContent = ({ detail }: MessageBusinessContentProps) => {
  if (detail?.businessType === MessageBusinessType.Other) {
    return (
      <Alert
        type='info'
        showIcon
        message='No structured business information for Other messages. The raw message remains available.'
      />
    );
  }
  const schema = getMessageSchema(detail?.businessType);
  if (!schema) {
    return (
      <Alert
        type='info'
        showIcon
        message='No business information template is available for this business type. View or download the raw message instead.'
      />
    );
  }
  return <MessageSchemaForm schema={schema} values={detail?.formData ?? {}} pattern='disabled' />;
};

export default ModalMessageRelated;
