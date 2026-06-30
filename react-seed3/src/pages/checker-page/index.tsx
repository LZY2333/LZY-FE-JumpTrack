import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, RollbackOutlined } from '@ant-design/icons';
import TaskForm from '@/components/TaskForm';
import type { Attachment, Customer } from '@/types';
import { approveTask, getCustomer, getTask, returnTask } from '@/api/tasks';

export default function CheckerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (!id) return;
    getTask(id).then(task => {
      setAttachments(task.attachments);
      return getCustomer(task.customerId);
    }).then(setCustomer);
  }, [id]);

  const handleReturn = () => {
    returnTask(id!).then(() => navigate('/'));
  };

  const handleApprove = () => {
    approveTask(id!).then(() => {
      message.success('审核通过');
      navigate('/');
    });
  };

  if (!customer) return <div className="flex justify-center pt-20"><Spin /></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
          <Typography.Text strong>任务 {id} – OPC AET Checker</Typography.Text>
        </div>
        <div className="flex gap-3">
          <Button icon={<RollbackOutlined />} onClick={handleReturn}>Return</Button>
          <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>Approve</Button>
        </div>
      </div>

      <TaskForm key={id} customer={customer} attachments={attachments} readonly />
    </div>
  );
}
