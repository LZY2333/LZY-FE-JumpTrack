import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import TaskForm from '@/components/TaskForm';
import type { TaskDetail } from '@/types/task';

export default function MakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);

  useEffect(() => {
    if (id) axios.get(`/api/task/${id}`).then(res => setTask(res.data.data));
  }, [id]);

  const handleSubmit = () => {
    axios.post(`/api/task/submit/${id}`).then(() => {
      message.success('提交成功');
      navigate('/');
    });
  };

  if (!task) return <div className="flex justify-center pt-20"><Spin /></div>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
        <Typography.Text strong>任务 {id} – OPC AET Maker</Typography.Text>
      </div>

      <TaskForm task={task} />

      <div className="mt-6 flex justify-between">
        <Button onClick={() => navigate('/')}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>Submit →</Button>
      </div>
    </div>
  );
}
