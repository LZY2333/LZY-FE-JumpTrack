import { Alert, Modal, Spin } from 'antd';
import useMessageDetail from './useMessageDetail';
import { MessageBasicInfoPanel, MessageBusinessInfoPanel } from './messageDetailContent';
import { resolveDisplayMessageId } from './util';

interface RelatedMessageDetailModalProps {
  /** 要展示的关联报文标识号。 */
  messageId: string;
  /** 控制弹窗显示状态。 */
  open: boolean;
  /** 关闭弹窗并清理当前选择。 */
  onClose: () => void;
}

/** 关联报文简化明细：只展示基础信息和结构化业务信息。 */
const RelatedMessageDetailModal = ({ messageId, open, onClose }: RelatedMessageDetailModalProps) => {
  const { detail, detailError } = useMessageDetail(messageId);

  return (
    <Modal
      centered
      destroyOnHidden
      footer={null}
      open={open}
      title={`关联报文 ${resolveDisplayMessageId(detail, messageId)}`}
      width={1200}
      onCancel={onClose}
    >
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      {!detail && !detailError ? (
        <div className='flex min-h-40 items-center justify-center'>
          <Spin size='small' tip='正在加载关联报文' />
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

export default RelatedMessageDetailModal;
