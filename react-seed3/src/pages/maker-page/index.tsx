import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton, Typography, message } from 'antd';
import { ArrowLeftOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { TaskFormRef } from '@/components/TaskForm';
import useTaskDetail from '@/hooks/useTaskDetail';
import { submitTask } from '@/api/tasks';

export default function MakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, attachments, loading } = useTaskDetail(id);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<TaskFormRef>(null);

  const handleSubmit = () => {
    const formApi = formRef.current;
    if (!id || !formApi) return;
    // 先校验必填项，通过后才提交；校验/提交失败均不跳转（提交错误已由 axios 拦截器统一提示）
    setSubmitting(true);
    formApi
      .validate()
      .then((updated) =>
        submitTask(id, updated).then(() => {
          message.success('提交成功');
          navigate('/');
        }),
      )
      .catch(() => {})
      .finally(() => setSubmitting(false));
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
          <Typography.Text strong>任务 {id} – OPC AET Maker</Typography.Text>
        </div>
        <div className="flex gap-3">
          <Button icon={<CloseOutlined />} onClick={() => navigate('/')}>Cancel</Button>
          <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>

      <TaskForm key={id} ref={formRef} customer={customer} attachments={attachments} />
    </div>
  );
}
