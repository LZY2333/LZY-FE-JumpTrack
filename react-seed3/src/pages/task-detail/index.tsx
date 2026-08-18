import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Input, Modal, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { type TaskFormRef } from '@/components/TaskForm';
import useTaskDetail from '@/pages/task-detail/useTaskDetail';
import { RoutePath } from '@/router/routes';
import useTaskPoolStore from '@/store/useTaskPoolStore';
import useUserStore from '@/store/useUserStore';
import { TaskStatus } from '@/types/enums';
import { approveTask, cancelTask, returnTask, submitTask } from '@/api/tasks';
import { getTaskAccess } from '@/pages/task-detail/taskAccess';

enum TaskAction {
  Submit,
  Cancel,
  Return,
  Approve,
}

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const requestTaskPoolRefresh = useTaskPoolStore((state) => state.requestRefresh);
  const { task, attachments } = useTaskDetail(taskId);
  const [activeAction, setActiveAction] = useState<TaskAction | null>(null);
  const formRef = useRef<TaskFormRef>(null);
  const access = getTaskAccess(task, user);

  const runAction = (action: TaskAction, request: () => Promise<unknown>, successMessage: string) => {
    setActiveAction(action);
    return request()
      .then(() => {
        message.success(successMessage);
        requestTaskPoolRefresh();
        navigate(RoutePath.TaskPool);
      })
      .finally(() => setActiveAction(null));
  };

  const handleSubmit = () => {
    if (!access.canEdit || activeAction !== null) return;

    formRef.current!.validate().then((payload) => {
      Modal.confirm({
        title: 'Confirm Submit',
        content: 'The task will move to Checker review after submission. Continue?',
        okText: 'Submit',
        cancelText: 'Cancel',
        autoFocusButton: null,
        onOk: () =>
          runAction(
            TaskAction.Submit,
            () => submitTask(task!.taskId, payload, access.userId),
            'Submitted successfully',
          ),
      });
    });
  };

  const handleCancel = () => {
    if (!access.canEdit || activeAction !== null) return;

    Modal.confirm({
      title: 'Confirm Cancel',
      content: 'The task will become Cancelled and cannot be recovered. Continue?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: () => runAction(TaskAction.Cancel, () => cancelTask(task!.taskId, access.userId), 'Cancelled successfully'),
    });
  };

  const handleReturn = () => {
    if (!access.canReview || activeAction !== null) return;

    let taskRemark = '';
    Modal.confirm({
      title: 'Confirm Return',
      content: (
        <div>
          <Typography.Paragraph>The task will be sent back to the Maker. Continue?</Typography.Paragraph>
          <Typography.Text className='mb-1 block'>
            Return reason <Typography.Text type='danger'>*</Typography.Text>
          </Typography.Text>
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
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: () => {
        const trimmedTaskRemark = taskRemark.trim();
        if (!trimmedTaskRemark) {
          message.error('Please enter return reason');
          return;
        }

        return runAction(
          TaskAction.Return,
          () => returnTask(task!.taskId, access.userId, trimmedTaskRemark),
          'Returned successfully',
        );
      },
    });
  };

  const handleApprove = () => {
    if (!access.canReview || activeAction !== null) return;

    Modal.confirm({
      title: 'Confirm Approve',
      content: 'The task will become Approved. Continue?',
      okText: 'Approve',
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: () => runAction(TaskAction.Approve, () => approveTask(task!.taskId, access.userId), 'Approved successfully'),
    });
  };

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(RoutePath.TaskPool)}>
            Back
          </Button>
          <Typography.Text strong>Task {task?.taskId ?? taskId}</Typography.Text>
        </div>
        <div className='flex gap-3'>
          {(task?.taskStatus === TaskStatus.Pending || task?.taskStatus === TaskStatus.Returned) && (
            <>
              <Tooltip title={access.editDisabledReason}>
                <span className={access.canEdit ? undefined : 'cursor-default'}>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={activeAction === TaskAction.Cancel}
                    disabled={!access.canEdit || activeAction !== null}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={access.editDisabledReason}>
                <span className={access.canEdit ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<SendOutlined />}
                    loading={activeAction === TaskAction.Submit}
                    disabled={!access.canEdit || activeAction !== null}
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
              <Tooltip title={access.reviewDisabledReason}>
                <span className={access.canReview ? undefined : 'cursor-default'}>
                  <Button
                    icon={<RollbackOutlined />}
                    loading={activeAction === TaskAction.Return}
                    disabled={!access.canReview || activeAction !== null}
                    onClick={handleReturn}
                  >
                    Return
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={access.reviewDisabledReason} placement='bottomRight' autoAdjustOverflow>
                <span className={access.canReview ? undefined : 'cursor-default'}>
                  <Button
                    type='primary'
                    icon={<CheckOutlined />}
                    loading={activeAction === TaskAction.Approve}
                    disabled={!access.canReview || activeAction !== null}
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

      <TaskForm
        key={task?.taskId ?? taskId}
        ref={formRef}
        initialValues={task ? { taskName: task.taskName, description: task.description } : undefined}
        attachments={attachments}
        readonly={!access.canEdit}
      />
    </div>
  );
};

export default TaskDetail;
