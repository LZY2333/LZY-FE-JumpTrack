import { Input, message, Typography } from 'antd';
import type { ModalFuncProps } from 'antd';

interface ModalApprovalApi {
  /** 在当前 Ant Design App 主题上下文中打开确认弹窗。 */
  confirm: (config: ModalFuncProps) => unknown;
}

/** 查询查复审批同意。 */
export const openModalInquiryReplyApprove = (modal: ModalApprovalApi): Promise<boolean> => {
  return new Promise((resolve) => {
    modal.confirm({
      title: 'Confirm Approval',
      content: 'Are you sure you want to approve this task?',
      okText: 'Approve',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

/** 查询查复审批拒绝。 */
export const openModalInquiryReplyReject = (modal: ModalApprovalApi): Promise<false | string> => {
  return new Promise((resolve) => {
    let rejectReason = '';

    modal.confirm({
      title: 'Confirm Rejection',
      content: (
        <>
          <Typography.Paragraph>Are you sure you want to reject this task?</Typography.Paragraph>
          <Input.TextArea
            maxLength={100}
            rows={3}
            placeholder='Enter reject reason'
            onChange={(event) => {
              rejectReason = event.target.value;
            }}
          />
        </>
      ),
      okText: 'Reject',
      okButtonProps: { danger: true },
      onOk: () => {
        const normalizedReason = rejectReason.trim();
        if (!normalizedReason) {
          message.warning('Reject reason is required');
          return Promise.reject();
        }

        resolve(normalizedReason);
      },
      onCancel: () => resolve(false),
    });
  });
};
