import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, DatePicker, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Moment } from 'moment';
import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';
import { TaskStatus, Role } from '@/types/enums';
import type { Task } from '@/mock/tasks';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.PendingChecker]: 'purple',
  [TaskStatus.Return]: 'orange',
  [TaskStatus.Done]: 'green',
};

const ALERT_KEY = 'cies_expiry_alerted';

export default function TaskPool() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);
  const [alertTasks, setAlertTasks] = useState<Task[]>([]);

  useEffect(() => {
    axios.get('/api/tasks').then(res => {
      const data: Task[] = res.data.data;
      setTasks(data);
      if (!sessionStorage.getItem(ALERT_KEY)) {
        const due = data.filter(t => t.daysUntilDue !== null && t.daysUntilDue <= 2);
        if (due.length) setAlertTasks(due);
      }
    });
  }, []);

  const filtered = useMemo(() => tasks.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (dateRange) {
      const [from, to] = [dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')];
      if (t.createdAt < from || t.createdAt > to) return false;
    }
    return true;
  }), [tasks, statusFilter, dateRange]);

  const handleDoubleClick = (record: Task) => {
    const { roles } = user;
    // 任务状态优先于角色：双角色用户（maker+checker）在任务已提交（Pending Checker）时进入 checker 页，
    // 否则进入 maker 页；纯 checker 用户始终进入 checker 页
    const toChecker =
      (record.status === TaskStatus.PendingChecker && roles.includes(Role.Checker)) ||
      (!roles.includes(Role.Maker) && roles.includes(Role.Checker));
    navigate(`/task/${toChecker ? 'checker' : 'maker'}/${record.id}`);
  };

  const closeAlert = () => {
    sessionStorage.setItem(ALERT_KEY, '1');
    setAlertTasks([]);
  };

  const columns: ColumnsType<Task> = [
    { title: 'Ref No', dataIndex: 'refNo', width: 100 },
    { title: 'Customer Name', dataIndex: 'customerName' },
    { title: '发起日期', dataIndex: 'createdAt', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 160,
      render: (status: TaskStatus) => <Badge color={STATUS_COLOR[status]} text={status} />,
    },
    {
      title: '到期天数',
      dataIndex: 'daysUntilDue',
      width: 100,
      render: (days: number | null) =>
        days !== null
          ? <span className={days <= 2 ? 'text-red-500 font-medium' : ''}>{days}d</span>
          : '-',
    },
  ];

  return (
    <>
      <div className="mb-2 text-xs text-gray-400">双击行可进入任务详情</div>
      <Space className="mb-4">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-40"
          options={[
            { value: '', label: '全部状态' },
            { value: TaskStatus.Pending, label: 'Pending' },
            { value: TaskStatus.PendingChecker, label: 'Pending Checker' },
            { value: TaskStatus.Return, label: 'Return' },
            { value: TaskStatus.Done, label: 'Done' },
          ]}
        />
        <DatePicker.RangePicker
          onChange={v => setDateRange(v?.[0] && v?.[1] ? [v[0] as Moment, v[1] as Moment] : null)}
        />
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        onRow={record => ({ onDoubleClick: () => handleDoubleClick(record), className: 'cursor-pointer' })}
        pagination={false}
      />
      <Modal
        title="任务即将到期"
        open={alertTasks.length > 0}
        onCancel={closeAlert}
        footer={<Button type="primary" onClick={closeAlert}>确认</Button>}
      >
        <p>以下任务将在 2 个工作日内到期，请尽快处理：</p>
        <ul className="mt-2 list-disc pl-5">
          {alertTasks.map(t => <li key={t.id}>{t.refNo} – {t.customerName}</li>)}
        </ul>
      </Modal>
    </>
  );
}
