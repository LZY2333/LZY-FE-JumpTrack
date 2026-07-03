import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TaskStatus } from '@/types/enums';
import type { Task } from '@/types';
import useTaskList from '@/hooks/useTaskList';
import useTableScrollY from '@/hooks/useTableScrollY';
import TaskFilters from '@/components/TaskFilters';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.Cancelled]: 'default',
  [TaskStatus.Submitted]: 'purple',
  [TaskStatus.Returned]: 'orange',
  [TaskStatus.Approved]: 'green',
};

export default function TaskPool() {
  const navigate = useNavigate();
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
    changeCusId,
    changeDateRange,
    reset,
  } = useTaskList();
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const scrollY = useTableScrollY(tableWrapRef);

  const openDetail = (record: Task) => navigate(`/task/${record.taskId}`);

  const columns: ColumnsType<Task> = [
    { title: 'Task ID', dataIndex: 'taskId', width: 100 },
    { title: 'Task Name', dataIndex: 'taskName' },
    { title: 'Customer ID (CIF)', dataIndex: 'cusId' },
    { title: 'Maker', dataIndex: 'inputId', width: 100, render: (inputId: string) => inputId || '-' },
    { title: 'Checker', dataIndex: 'authoriserId', width: 100, render: (authoriserId: string) => authoriserId || '-' },
    { title: 'Created Date', dataIndex: 'createDate', width: 120 },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      width: 160,
      render: (taskStatus: TaskStatus) => <Badge color={STATUS_COLOR[taskStatus]} text={taskStatus} />,
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Button type="link" size="small" className="px-0" onClick={() => openDetail(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-2 text-xs text-gray-400">Double-click a row, or click "View" to open task details</div>
      <TaskFilters
        status={status}
        dateRange={dateRange}
        onStatusChange={changeStatus}
        onCusIdChange={changeCusId}
        onDateRangeChange={changeDateRange}
        onReset={reset}
      />
      <div ref={tableWrapRef}>
        <Table
          rowKey="taskId"
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
            showTotal: (count) => `Total ${count}`,
            onChange: (nextPage, ps) => {
              setPage(nextPage);
              setPageSize(ps);
            },
          }}
        />
      </div>
    </div>
  );
}
