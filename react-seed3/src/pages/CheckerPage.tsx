import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import TaskForm from '@/components/TaskForm';
import useAuthStore from '@/store/useAuthStore';
import type { TaskDetail } from '@/types/task';

export default function CheckerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState<TaskDetail | null>(null);

  useEffect(() => {
    if (id) axios.get(`/api/task/${id}`).then(res => setTask(res.data.data));
  }, [id]);

  const handleReturn = () => {
    axios.post(`/api/task/return/${id}`).then(() => navigate('/'));
  };

  const handleApprove = () => {
    if (task?.makerId === user.id) {
      message.error('Maker 与 Checker 不能为同一人');
      return;
    }
    axios.post(`/api/task/approve/${id}`).then(() => {
      message.success('审核通过');
      navigate('/');
    });
  };

  if (!task) return <div className="flex justify-center pt-20"><Spin /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
        <Typography.Text strong>任务 {id} – OPC AET Checker</Typography.Text>
      </div>

      <TaskForm task={task} readonly modifiedFields={task.modifiedFields} />

      <div className="mt-6 flex justify-between">
        <Button icon={<ArrowLeftOutlined />} onClick={handleReturn}>Return</Button>
        <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>Approve ✓</Button>
      </div>
    </div>
  );
}
