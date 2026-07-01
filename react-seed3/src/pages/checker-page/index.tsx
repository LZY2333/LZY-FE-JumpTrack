import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Modal, Skeleton, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, RollbackOutlined } from '@ant-design/icons';
import TaskForm from '@/components/TaskForm';
import useTaskDetail from '@/hooks/useTaskDetail';
import { approveTask, returnTask } from '@/api/tasks';

export default function CheckerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, attachments, loading } = useTaskDetail(id);
  const [returning, setReturning] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleReturn = () => {
    if (!id) return;
    // 退回是重要动作：二次确认后再执行，与 Approve 一样给出结果提示
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
            message.success('已退回');
            navigate('/');
          })
          .finally(() => setReturning(false));
      },
    });
  };

  const handleApprove = () => {
    if (!id) return;
    setApproving(true);
    approveTask(id)
      .then(() => {
        message.success('审核通过');
        navigate('/');
      })
      .finally(() => setApproving(false));
  };

  if (loading || !customer) {
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
          <Typography.Text strong>任务 {id} – OPC AET Checker</Typography.Text>
        </div>
        <div className="flex gap-3">
          <Button icon={<RollbackOutlined />} loading={returning} onClick={handleReturn}>
            Return
          </Button>
          <Button type="primary" icon={<CheckOutlined />} loading={approving} onClick={handleApprove}>
            Approve
          </Button>
        </div>
      </div>

      <TaskForm key={id} customer={customer} attachments={attachments} readonly />
    </div>
  );
}
