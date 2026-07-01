import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import useUserStore from '@/store/useUserStore';
import { TaskStatus, Role } from '@/types/enums';
import type { Task } from '@/types';
import useTaskList from '@/hooks/useTaskList';
import useTableScrollY from '@/hooks/useTableScrollY';
import TaskFilters from '@/components/TaskFilters';
import ExpiryAlertModal from '@/components/ExpiryAlertModal';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.Cancelled]: 'default',
  [TaskStatus.Submitted]: 'purple',
  [TaskStatus.Returned]: 'orange',
  [TaskStatus.Approved]: 'green',
};

export default function TaskPool() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const {
    tasks,
    total,
    loading,
    page,
    pageSize,
    status,
    dateRange,
    setPage,
    setPageSize,
    changeStatus,
    changeCustomerName,
    changeDateRange,
    reset,
  } = useTaskList();
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const scrollY = useTableScrollY(tableWrapRef);

  const openDetail = (record: Task) => {
    if (!user) return;
    const { roles } = user;
    // 任务状态优先于角色：双角色用户（maker+checker）在任务已提交（Pending Checker）时进入 checker 页，
    // 否则进入 maker 页；纯 checker 用户始终进入 checker 页
    const toChecker =
      (record.status === TaskStatus.Submitted && roles.includes(Role.Checker)) ||
      (!roles.includes(Role.Maker) && roles.includes(Role.Checker));
    navigate(`/task/${toChecker ? 'checker' : 'maker'}/${record.id}`);
  };

  const columns: ColumnsType<Task> = [
    { title: 'Ref No', dataIndex: 'refNo', width: 100 },
    { title: 'Customer Name', dataIndex: 'customerName' },
    { title: '发起日期', dataIndex: 'createdAt', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 160,
      render: (s: TaskStatus) => <Badge color={STATUS_COLOR[s]} text={s} />,
    },
    {
      title: '到期天数',
      dataIndex: 'daysUntilDue',
      width: 100,
      align: 'center',
      render: (days: number | null) =>
        days === null ? '-' : <Tag color={days <= 2 ? 'red' : 'blue'}>{days}d</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Button type="link" size="small" className="px-0" onClick={() => openDetail(record)}>
          进入
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-2 text-xs text-gray-400">双击任意行，或点击「进入」打开任务详情</div>
      <TaskFilters
        status={status}
        dateRange={dateRange}
        onStatusChange={changeStatus}
        onCustomerNameChange={changeCustomerName}
        onDateRangeChange={changeDateRange}
        onReset={reset}
      />
      <div ref={tableWrapRef}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          onRow={(record) => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
          scroll={{ y: scrollY }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </div>
      <ExpiryAlertModal />
    </div>
  );
}
