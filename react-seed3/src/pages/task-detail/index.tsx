import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Modal, Skeleton, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, RollbackOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { TaskFormRef } from '@/components/TaskForm';
import useTaskDetail from '@/hooks/useTaskDetail';
import useUserStore from '@/store/useUserStore';
import { Role, TaskStatus } from '@/types/enums';
import { approveTask, cancelTask, returnTask, submitTask } from '@/api/tasks';

const EDITABLE_STATUSES = [TaskStatus.Pending, TaskStatus.Returned];

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { task, customer, attachments, loading } = useTaskDetail(id);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [approving, setApproving] = useState(false);
  const formRef = useRef<TaskFormRef>(null);

  const roles = user?.roles ?? [];
  const isMaker = roles.includes(Role.Maker);
  const isChecker = roles.includes(Role.Checker);
  const isEditableStage = !!task && EDITABLE_STATUSES.includes(task.status);
  const canEdit = isEditableStage && isMaker;
  const isSelfApproval = !!task && !!user && task.makerId === user.id;
  const canApprove = isChecker && !isSelfApproval;

  const handleSubmit = () => {
    const formApi = formRef.current;
    if (!id || !formApi) return;
    formApi
      .validate()
      .then((updated) => {
        Modal.confirm({
          title: '确认提交任务',
          content: '提交后任务将转入 Checker 审核，确定提交吗？',
          okText: '提交',
          cancelText: '取消',
          onOk: () => {
            if (!user) return;
            setSubmitting(true);
            return submitTask(id, updated, user.id)
              .then(() => {
                message.success('提交操作 成功');
                navigate('/');
              })
              .finally(() => setSubmitting(false));
          },
        });
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    if (!id) return;
    Modal.confirm({
      title: '确认取消任务',
      content: '取消后任务将变为已取消状态，且不可恢复，确定取消吗？',
      okText: '取消任务',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setCancelling(true);
        return cancelTask(id)
          .then(() => {
            message.success('取消操作 成功');
            navigate('/');
          })
          .finally(() => setCancelling(false));
      },
    });
  };

  const handleReturn = () => {
    if (!id) return;
    Modal.confirm({
      title: '确认退回任务',
      content: '退回后任务将回到 Maker 处理，确定退回吗？',
      okText: '退回',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setReturning(true);
        return returnTask(id)
          .then(() => {
            message.success('退回操作 成功');
            navigate('/');
          })
          .finally(() => setReturning(false));
      },
    });
  };

  const handleApprove = () => {
    if (!id) return;
    Modal.confirm({
      title: '确认审核通过',
      content: '通过后任务将进入已批准状态，确定通过吗？',
      okText: '通过',
      cancelText: '取消',
      onOk: () => {
        setApproving(true);
        return approveTask(id)
          .then(() => {
            message.success('审核操作 成功');
            navigate('/');
          })
          .finally(() => setApproving(false));
      },
    });
  };

  if (loading || !customer || !task) {
    return (
      <div className="animate-fade-in">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
          <Typography.Text strong>任务 {id} – OPC AET</Typography.Text>
        </div>
        <div className="flex gap-3">
          {isEditableStage && (
            <>
              <Tooltip title={isMaker ? '' : 'Maker 可操作'}>
                <span className={isMaker ? undefined : 'cursor-default'}>
                  <Button danger icon={<CloseOutlined />} loading={cancelling} disabled={!isMaker} onClick={handleCancel}>
                    Cancel
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={isMaker ? '' : 'Maker 可操作'}>
                <span className={isMaker ? undefined : 'cursor-default'}>
                  <Button type="primary" icon={<SendOutlined />} loading={submitting} disabled={!isMaker} onClick={handleSubmit}>
                    Submit
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
          {task.status === TaskStatus.Submitted && (
            <>
              <Tooltip title={isChecker ? '' : 'Checker 可操作'}>
                <span className={isChecker ? undefined : 'cursor-default'}>
                  <Button icon={<RollbackOutlined />} loading={returning} disabled={!isChecker} onClick={handleReturn}>
                    Return
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={canApprove ? '' : isSelfApproval ? '不能审批自己提交的任务' : 'Checker 可操作'}>
                <span className={canApprove ? undefined : 'cursor-default'}>
                  <Button type="primary" icon={<CheckOutlined />} loading={approving} disabled={!canApprove} onClick={handleApprove}>
                    Approve
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <TaskForm key={id} ref={formRef} customer={customer} attachments={attachments} readonly={!canEdit} />
    </div>
  );
}
