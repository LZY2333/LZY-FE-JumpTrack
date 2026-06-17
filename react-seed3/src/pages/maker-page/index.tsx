import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import TaskForm, { TaskFormRef } from '@/components/TaskForm';
import type { TaskDetail } from '@/types';
import { getTask, submitTask } from '@/api/tasks';

export default function MakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const formRef = useRef<TaskFormRef>(null);

  useEffect(() => {
    if (id) getTask(id).then(setTask);
  }, [id]);

  const handleSubmit = () => {
    const updated = formRef.current?.getValues();
    if (!id || !updated) return;
    submitTask(id, updated).then(() => {
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

      <TaskForm ref={formRef} task={task} />

      <div className="mt-6 flex justify-between">
        <Button onClick={() => navigate('/')}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>Submit →</Button>
      </div>
    </div>
  );
}
