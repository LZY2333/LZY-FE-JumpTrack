import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Input, Modal, Skeleton, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { type TaskFormRef } from '@/components/TaskForm';
import useTaskDetail from '@/pages/task-detail/useTaskDetail';
import useUserStore from '@/store/useUserStore';
import { Role, TaskStatus } from '@/types/enums';
import { approveTask, cancelTask, returnTask, submitTask } from '@/api/tasks';
import type { TaskStatusPayload } from '@/api/tasks';

const EDITABLE_STATUSES = [TaskStatus.Pending, TaskStatus.Returned];

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { task, customer, customerChange, attachments, loading, error } = useTaskDetail(taskId);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [approving, setApproving] = useState(false);
  const formRef = useRef<TaskFormRef>(null);
  const isMutating = submitting || cancelling || returning || approving;

  const roles = user?.roles ?? [];
  const isMaker = roles.includes(Role.Maker);
  const isChecker = roles.includes(Role.Checker);
  const isEditableStage = !!task && EDITABLE_STATUSES.includes(task.taskStatus);
  const isAssignedMaker = !task?.makerId || task.makerId === user?.id;
  const canEdit = isEditableStage && isMaker && isAssignedMaker;
  const isSelfReview = !!task?.makerId && task.makerId === user?.id;
  const canReview = isChecker && !isSelfReview;
  const makerTooltip = !isMaker ? 'Maker only' : !isAssignedMaker ? 'Assigned Maker only' : '';
  const checkerTooltip = !isChecker ? 'Checker only' : isSelfReview ? 'You cannot review your own submission' : '';
  const loadErrorMessage = [error, !customer && 'Customer data is missing', !task && 'Task data is missing']
    .filter(Boolean)
    .join('; ');

  const handleSubmit = () => {
    const formApi = formRef.current;
    if (!taskId || !formApi || !user || !canEdit || isMutating) return;
    formApi.validate().then((updated) => {
      Modal.confirm({
        title: 'Confirm Submit',
        content: 'The task will move to Checker review after submission. Continue?',
        okText: 'Submit',
        cancelText: 'Cancel',
        onOk: () => {
          setSubmitting(true);
          const payload: TaskStatusPayload = { ...updated };
          return submitTask(taskId, payload, user.id)
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
    if (!taskId || !user || !canEdit || isMutating) return;
    Modal.confirm({
      title: 'Confirm Cancel',
      content: 'The task will become Cancelled and cannot be recovered. Continue?',
      okText: 'Cancel Task',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        setCancelling(true);
        return cancelTask(taskId, user.id)
          .then(() => {
            message.success('Cancelled successfully');
            navigate('/');
          })
          .finally(() => setCancelling(false));
      },
    });
  };

  const handleReturn = () => {
    if (!taskId || !user || !canReview || isMutating) return;
    let taskRemark = '';
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
              taskRemark = event.target.value;
            }}
          />
        </div>
      ),
      okText: 'Return',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        setReturning(true);
        return returnTask(taskId, user.id, taskRemark.trim())
          .then(() => {
            message.success('Returned successfully');
            navigate('/');
          })
          .finally(() => setReturning(false));
      },
    });
  };

  const handleApprove = () => {
    if (!taskId || !user || !canReview || isMutating) return;
    Modal.confirm({
      title: 'Confirm Approve',
      content: 'The task will become Approved. Continue?',
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: () => {
        setApproving(true);
        return approveTask(taskId, user.id)
          .then(() => {
            message.success('Approved successfully');
            navigate('/');
          })
          .finally(() => setApproving(false));
      },
    });
  };

  if (loading) {
    return (
      <div className='animate-fade-in'>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className='animate-fade-in'>
      {loadErrorMessage && <Alert className='mb-4' type='error' showIcon message={loadErrorMessage} />}

      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            Back
          </Button>
          <Typography.Text strong>Task {task?.taskId ?? taskId ?? '-'} – OPC AET</Typography.Text>
        </div>
        <div className='flex gap-3'>
          {isEditableStage && (
            <>
              <Tooltip title={makerTooltip}>
                <span className={canEdit ? undefined : 'cursor-default'}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={cancelling}
                    disabled={!canEdit || isMutating}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={makerTooltip}>
                <span className={canEdit ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<SendOutlined />}
                    loading={submitting}
                    disabled={!canEdit || isMutating}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
          {task?.taskStatus === TaskStatus.Submitted && (
            <>
              <Tooltip title={checkerTooltip}>
                <span className={canReview ? undefined : 'cursor-default'}>
                  <Button
                    icon={<RollbackOutlined />}
                    loading={returning}
                    disabled={!canReview || isMutating}
                    onClick={handleReturn}
                  >
                    Return
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={checkerTooltip}>
                <span className={canReview ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<CheckOutlined />}
                    loading={approving}
                    disabled={!canReview || isMutating}
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

      {task?.taskStatus === TaskStatus.Returned && (
        <Alert
          className='mb-4'
          message='Return reason'
          description={task.taskRemark || 'N/A'}
          type='warning'
          showIcon
        />
      )}

      {task && customer && (
        <TaskForm
          key={task.taskId}
          ref={formRef}
          taskId={task.taskId}
          customer={customer}
          customerChange={customerChange}
          attachments={attachments}
          readonly={!canEdit}
        />
      )}
    </div>
  );
}
