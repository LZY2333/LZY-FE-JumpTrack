import { Input, message, Modal, Typography } from 'antd';

/** 审批同意 */
export const openModalApprove = (): Promise<boolean> => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: 'Confirm Approval',
      content: 'Are you sure you want to approve this task?',
      okText: 'Approve',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};

/** 审批拒绝 */
export const openModalReject = (): Promise<false | string> => {
  return new Promise((resolve) => {
    let rejectReason = '';

    Modal.confirm({
      title: 'Confirm Rejection',
      content: (
        <>
          <Typography.Paragraph>Are you sure you want to reject this task?</Typography.Paragraph>
          <Input.TextArea
            maxLength={100}
            rows={3}
            showCount
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
