import { Input, message, Typography } from 'antd';
import type { ModalFuncProps } from 'antd';

/** 发报异常审批弹窗能力。 */
interface ModalApprovalApi {
  /** 使用当前应用主题打开确认弹窗。 */
  confirm: (config: ModalFuncProps) => unknown;
}

/** 发报异常一级审批通过，确认具体经办操作。 */
export const openModalExceptionOutApprove = (modal: ModalApprovalApi, operationLabel: string): Promise<boolean> =>
  new Promise((resolve) => {
    modal.confirm({
      title: 'Confirm Approval',
      content: `Are you sure you want to approve the maker's request: ${operationLabel}?`,
      okText: 'Approve',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

/** 发报异常一级审批拒绝，必填拒绝原因。 */
export const openModalExceptionOutReject = (modal: ModalApprovalApi): Promise<false | string> =>
  new Promise((resolve) => {
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
