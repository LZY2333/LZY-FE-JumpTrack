import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Button, Form, Input, Tooltip, Typography } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import { TaskDescription, TaskName } from '@/components/FormItem';
import useTaskDetail from '@/pages/task-detail/useTaskDetail';
import { RoutePath } from '@/router/routes';
import useTaskPoolStore from '@/store/useTaskPoolStore';
import useUserStore from '@/store/useUserStore';
import { TaskStatus } from '@/types/enums';
import { updateTask } from '@/api/tasks';
import { getTaskAccess } from '@/pages/task-detail/taskAccess';
import { omitEmptyValues } from '@/utils/formUtil';

enum TaskAction {
  Submit,
  Cancel,
  Return,
  Approve,
}

interface TaskFormValues {
  taskName: string;
  description: string;
}

const TaskDetail = () => {
  // 使用 antd App 上下文实例，使消息和确认框继承根 ConfigProvider；不要改回脱离上下文的静态 API。
  const { message, modal } = App.useApp();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const requestTaskPoolRefresh = useTaskPoolStore((state) => state.requestRefresh);
  const task = useTaskDetail(taskId);
  const [activeAction, setActiveAction] = useState<TaskAction | null>(null);
  const [form] = Form.useForm<TaskFormValues>();
  const access = getTaskAccess(task, user);

  useEffect(() => {
    if (!task) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({ taskName: task.taskName, description: task.description });
  }, [form, task]);

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

    form.validateFields().then((values) => {
      modal.confirm({
        title: 'Confirm Submit',
        content: 'The task will move to Checker review after submission. Continue?',
        okText: 'Submit',
        cancelText: 'Cancel',
        autoFocusButton: null,
        onOk: () =>
          runAction(
            TaskAction.Submit,
            () =>
              updateTask(task!.taskId, {
                taskStatus: TaskStatus.Submitted,
                operatorId: access.userId,
                ...omitEmptyValues({
                  taskName: values.taskName.trim(),
                  description: values.description?.trim(),
                }),
              }),
            'Submitted successfully',
          ),
      });
    });
  };

  const handleCancel = () => {
    if (!access.canEdit || activeAction !== null) return;

    modal.confirm({
      title: 'Confirm Cancel',
      content: 'The task will become Cancelled and cannot be recovered. Continue?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: () =>
        runAction(
          TaskAction.Cancel,
          () =>
            updateTask(task!.taskId, {
              taskStatus: TaskStatus.Cancelled,
              operatorId: access.userId,
            }),
          'Cancelled successfully',
        ),
    });
  };

  const handleReturn = () => {
    if (!access.canReview || activeAction !== null) return;

    let taskRemark = '';
    modal.confirm({
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
          () =>
            updateTask(task!.taskId, {
              taskStatus: TaskStatus.Returned,
              operatorId: access.userId,
              taskRemark: trimmedTaskRemark,
            }),
          'Returned successfully',
        );
      },
    });
  };

  const handleApprove = () => {
    if (!access.canReview || activeAction !== null) return;

    modal.confirm({
      title: 'Confirm Approve',
      content: 'The task will become Approved. Continue?',
      okText: 'Approve',
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: () =>
        runAction(
          TaskAction.Approve,
          () =>
            updateTask(task!.taskId, {
              taskStatus: TaskStatus.Approved,
              operatorId: access.userId,
            }),
          'Approved successfully',
        ),
    });
  };

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            color='primary'
            variant='solid'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(RoutePath.TaskPool)}
          >
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
                    color='danger'
                    variant='solid'
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
                    color='primary'
                    variant='solid'
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
                    color='primary'
                    variant='solid'
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
                    color='primary'
                    variant='solid'
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

      <Form<TaskFormValues> form={form} layout='vertical' disabled={!access.canEdit} scrollToFirstError>
        <TaskName />
        <TaskDescription />
      </Form>
    </div>
  );
};

export default TaskDetail;
