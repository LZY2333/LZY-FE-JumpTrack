import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Input, Modal, Skeleton, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { TaskFormRef } from '@/components/TaskForm';
import useTaskDetail, { buildNewValue } from '@/hooks/useTaskDetail';
import useUserStore from '@/store/useUserStore';
import { Role, TaskStatus } from '@/types/enums';
import { approveTask, cancelTask, returnTask, submitTask } from '@/api/tasks';
import type { TaskStatusPayload } from '@/api/tasks';

const EDITABLE_STATUSES = [TaskStatus.Pending, TaskStatus.Returned];

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { task, customer, originalCustomer, attachments, loading } = useTaskDetail(id);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [approving, setApproving] = useState(false);
  const formRef = useRef<TaskFormRef>(null);

  const roles = user?.roles ?? [];
  const isMaker = roles.includes(Role.Maker);
  const isChecker = roles.includes(Role.Checker);
  const isEditableStage = !!task && EDITABLE_STATUSES.includes(task.taskStatus);
  const canEdit = isEditableStage && isMaker;
  const isSelfApproval = !!task && !!user && task.inputId === user.id;
  const canApprove = isChecker && !isSelfApproval;

  const handleSubmit = () => {
    const formApi = formRef.current;
    if (!id || !formApi || !originalCustomer) return;
    formApi.validate().then((updated) => {
      Modal.confirm({
        title: 'Confirm Submit',
        content: 'The task will move to Checker review after submission. Continue?',
        okText: 'Submit',
        cancelText: 'Cancel',
        onOk: () => {
          if (!user) return;
          setSubmitting(true);
          const payload: TaskStatusPayload = {
            newValue: buildNewValue(updated.customer, originalCustomer),
            attachments: updated.attachments,
          };
          return submitTask(id, payload, user.id)
            .then(() => {
              message.success('Submitted successfully');
              navigate('/');
            })
            .finally(() => setSubmitting(false));
        },
      });
    });
  };

  const handleCancel = () => {
    if (!id || !user) return;
    Modal.confirm({
      title: 'Confirm Cancel',
      content: 'The task will become Cancelled and cannot be recovered. Continue?',
      okText: 'Cancel Task',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        setCancelling(true);
        return cancelTask(id, user.id)
          .then(() => {
            message.success('Cancelled successfully');
            navigate('/');
          })
          .finally(() => setCancelling(false));
      },
    });
  };

  const handleReturn = () => {
    if (!id || !user) return;
    let remarkMsg = '';
    Modal.confirm({
      title: 'Confirm Return',
      content: (
        <div>
          <Typography.Paragraph>The task will be sent back to the Maker. Continue?</Typography.Paragraph>
          <Input
            placeholder='Enter return reason'
            maxLength={50}
            showCount
            onChange={(event) => {
              remarkMsg = event.target.value;
            }}
          />
        </div>
      ),
      okText: 'Return',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        setReturning(true);
        return returnTask(id, user.id, remarkMsg.trim())
          .then(() => {
            message.success('Returned successfully');
            navigate('/');
          })
          .finally(() => setReturning(false));
      },
    });
  };

  const handleApprove = () => {
    if (!id || !user) return;
    Modal.confirm({
      title: 'Confirm Approve',
      content: 'The task will become Approved. Continue?',
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: () => {
        setApproving(true);
        return approveTask(id, user.id)
          .then(() => {
            message.success('Approved successfully');
            navigate('/');
          })
          .finally(() => setApproving(false));
      },
    });
  };

  if (loading || !customer || !originalCustomer || !task) {
    return (
      <div className='animate-fade-in'>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className='animate-fade-in'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            Back
          </Button>
          <Typography.Text strong>Task {id} – OPC AET</Typography.Text>
        </div>
        <div className='flex gap-3'>
          {isEditableStage && (
            <>
              <Tooltip title={isMaker ? '' : 'Maker only'}>
                <span className={isMaker ? undefined : 'cursor-default'}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={cancelling}
                    disabled={!isMaker}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={isMaker ? '' : 'Maker only'}>
                <span className={isMaker ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<SendOutlined />}
                    loading={submitting}
                    disabled={!isMaker}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
          {task.taskStatus === TaskStatus.Submitted && (
            <>
              <Tooltip title={isChecker ? '' : 'Checker only'}>
                <span className={isChecker ? undefined : 'cursor-default'}>
                  <Button icon={<RollbackOutlined />} loading={returning} disabled={!isChecker} onClick={handleReturn}>
                    Return
                  </Button>
                </span>
              </Tooltip>
              <Tooltip
                title={canApprove ? '' : isSelfApproval ? 'You cannot approve your own submission' : 'Checker only'}
              >
                <span className={canApprove ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<CheckOutlined />}
                    loading={approving}
                    disabled={!canApprove}
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {task.taskStatus === TaskStatus.Returned && (
        <Alert className='mb-4' message='Return reason' description={task.remarkMsg || 'N/A'} type='warning' showIcon />
      )}

      <TaskForm
        key={id}
        ref={formRef}
        taskId={task.taskId}
        customer={customer}
        originalCustomer={originalCustomer}
        attachments={attachments}
        readonly={!canEdit}
      />
    </div>
  );
}
