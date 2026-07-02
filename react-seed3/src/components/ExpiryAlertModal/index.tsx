import { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import type { Task } from '@/types';
import { getDueTasks } from '@/api/tasks';

const ALERT_KEY = 'cies_expiry_alerted';

// 到期提醒：独立于任务池分页，每个会话仅弹一次（sessionStorage 门控）。
export default function ExpiryAlertModal() {
  const [alertTasks, setAlertTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem(ALERT_KEY)) return;
    getDueTasks().then((due) => {
      if (due.length) setAlertTasks(due);
    });
  }, []);

  const close = () => {
    sessionStorage.setItem(ALERT_KEY, '1');
    setAlertTasks([]);
  };

  return (
    <Modal
      title="任务即将到期"
      open={alertTasks.length > 0}
      onCancel={close}
      footer={<Button type="primary" onClick={close}>确认</Button>}>
      <p>以下任务将在 2 个工作日内到期，请尽快处理：</p>
      <ul className="mt-2 list-disc pl-5">
        {alertTasks.map((task) => (
          <li key={task.id}>{task.refNo} – {task.customerName}</li>
        ))}
      </ul>
    </Modal>
  );
}
