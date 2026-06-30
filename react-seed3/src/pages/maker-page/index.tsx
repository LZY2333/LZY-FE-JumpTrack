import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import TaskForm, { TaskFormRef } from '@/components/TaskForm';
import type { Attachment, Customer } from '@/types';
import { getCustomer, getTask, submitTask } from '@/api/tasks';

export default function MakerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const formRef = useRef<TaskFormRef>(null);

  useEffect(() => {
    if (!id) return;
    // 任务携带 customerId 与附件，进入表单时再据 customerId 查询客户详情
    getTask(id).then(task => {
      setAttachments(task.attachments);
      return getCustomer(task.customerId);
    }).then(setCustomer);
  }, [id]);

  const handleSubmit = () => {
    const formApi = formRef.current;
    if (!id || !formApi) return;
    // 先校验必填项，通过后才提交；校验/提交失败均不跳转（提交错误已由 axios 拦截器统一提示）
    formApi
      .validate()
      .then(updated =>
        submitTask(id, updated).then(() => {
          message.success('提交成功');
          navigate('/');
        }),
      )
      .catch(() => {});
  };

  if (!customer) return <div className="flex justify-center pt-20"><Spin /></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
          <Typography.Text strong>任务 {id} – OPC AET Maker</Typography.Text>
        </div>
        <div className="flex gap-3">
          <Button icon={<CloseOutlined />} onClick={() => navigate('/')}>Cancel</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>Submit</Button>
        </div>
      </div>

      <TaskForm key={id} ref={formRef} customer={customer} attachments={attachments} />
    </div>
  );
}
