import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Input, Modal, Skeleton, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { type TaskFormRef } from '@/components/TaskForm';
import useTaskDetail from '@/pages/task-detail/useTaskDetail';
import { RoutePath } from '@/router/routes';
import useTaskPoolStore from '@/store/useTaskPoolStore';
import useUserStore from '@/store/useUserStore';
import { TaskStatus } from '@/types/enums';
import { approveTask, cancelTask, returnTask, submitTask } from '@/api/tasks';
import type { TaskStatusPayload } from '@/api/tasks';
import { buildCustomerChange, toCustomerFormModel } from '@/pages/task-detail/customerFormUtil';
import { getTaskAccess } from '@/pages/task-detail/taskAccess';

enum TaskAction {
  Submit,
  Cancel,
  Return,
  Approve,
}

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const requestTaskPoolRefresh = useTaskPoolStore((state) => state.requestRefresh);
  const { task, customer, customerChange, attachments, loading, error } = useTaskDetail(taskId);
  const taskFormData = useMemo(() => {
    if (!customer) return null;

    const customerForm = toCustomerFormModel(customer);
    return {
      customer,
      customerForm,
      initialForm: customerChange ? toCustomerFormModel(customerChange) : customerForm,
    };
  }, [customer, customerChange]);
  const [activeAction, setActiveAction] = useState<TaskAction | null>(null);
  const formRef = useRef<TaskFormRef>(null);

  if (loading) {
    return (
      <div className='animate-fade-in'>
        <Skeleton active paragraph={{ rows: 8 }} />
        <TaskForm empty />
      </div>
    );
  }

  if (error || !task || !taskFormData) {
    const loadErrorMessage = [error, !customer && 'Customer data is missing', !task && 'Task data is missing']
      .filter(Boolean)
      .join('; ');

    return (
      <div className='animate-fade-in'>
        <Alert className='mb-4' type='error' showIcon message={loadErrorMessage || 'Task form data is missing'} />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(RoutePath.TaskPool)}>
          Back
        </Button>
        <div className='mt-4'>
          <TaskForm empty />
        </div>
      </div>
    );
  }

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
    const formApi = formRef.current;
    if (!formApi || !access.canEdit || activeAction !== null) return;

    formApi.validate().then((updated) => {
      const customerChangeNew = buildCustomerChange(
        taskFormData.customer,
        taskFormData.customerForm,
        updated.customerFormNew,
      );
      const payload: TaskStatusPayload = {
        attachments: updated.attachments,
        ...(customerChangeNew ? { customerChange: customerChangeNew } : {}),
      };

      Modal.confirm({
        title: 'Confirm Submit',
        content: 'The task will move to Checker review after submission. Continue?',
        okText: 'Submit',
        cancelText: 'Cancel',
        onOk: () =>
          runAction(TaskAction.Submit, () => submitTask(task.taskId, payload, access.userId), 'Submitted successfully'),
      });
    });
  };

  const handleCancel = () => {
    if (!access.canEdit || activeAction !== null) return;

    Modal.confirm({
      title: 'Confirm Cancel',
      content: 'The task will become Cancelled and cannot be recovered. Continue?',
      okText: 'Cancel Task',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => runAction(TaskAction.Cancel, () => cancelTask(task.taskId, access.userId), 'Cancelled successfully'),
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
      onOk: () =>
        runAction(
          TaskAction.Return,
          () => returnTask(task.taskId, access.userId, taskRemark.trim()),
          'Returned successfully',
        ),
    });
  };

  const handleApprove = () => {
    if (!access.canReview || activeAction !== null) return;

    Modal.confirm({
      title: 'Confirm Approve',
      content: 'The task will become Approved. Continue?',
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: () => runAction(TaskAction.Approve, () => approveTask(task.taskId, access.userId), 'Approved successfully'),
    });
  };

  return (
    <div className='animate-fade-in'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(RoutePath.TaskPool)}>
            Back
          </Button>
          <Typography.Text strong>Task {task.taskId} – OPC AET</Typography.Text>
        </div>
        <div className='flex gap-3'>
          {(task.taskStatus === TaskStatus.Pending || task.taskStatus === TaskStatus.Returned) && (
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
          {task.taskStatus === TaskStatus.Submitted && (
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
              <Tooltip title={access.reviewDisabledReason}>
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

      {task.taskStatus === TaskStatus.Returned && (
        <Alert
          className='mb-4'
          message='Return reason'
          description={task.taskRemark || 'N/A'}
          type='warning'
          showIcon
        />
      )}

      <TaskForm
        key={task.taskId}
        ref={formRef}
        taskId={task.taskId}
        initialForm={taskFormData.initialForm}
        customerForm={taskFormData.customerForm}
        attachments={attachments}
        readonly={!access.canEdit}
      />
    </div>
  );
}
