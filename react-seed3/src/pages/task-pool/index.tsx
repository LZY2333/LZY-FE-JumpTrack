import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Col, Form, Row } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Moment } from 'moment';
import { useDebounceFn } from 'ahooks';
import { TaskStatus } from '@/types/enums';
import type { Task } from '@/types';
import useTaskList from '@/hooks/useTaskList';
import useTableScrollY from '@/hooks/useTableScrollY';
import ResizableTable from '@/components/ResizableTable';
import { TaskStatusFilter, TaskCusIdFilter, TaskDateRangeFilter } from '@/components/FormItem';

interface FilterValues {
  status: string;
  cusId: string;
  dateRange: [Moment, Moment] | null;
}

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
    setPage,
    setPageSize,
    changeStatus,
    changeCusId,
    changeDateRange,
    reset,
  } = useTaskList();
  const [form] = Form.useForm();
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const scrollY = useTableScrollY(tableWrapRef);

  // 客户号防抖：输入即时回显由 Form 受控管理，300ms 后才把值推给查询
  const { run: applyCusId, cancel: cancelApplyCusId } = useDebounceFn(
    (value: string) => changeCusId(value),
    { wait: 300 },
  );

  // 状态/日期即时查询，客户号走防抖；字段变更由 Form 统一分发
  const handleValuesChange = (changed: Partial<FilterValues>) => {
    if ('status' in changed) changeStatus(changed.status ?? '');
    if ('dateRange' in changed) {
      const range = changed.dateRange;
      changeDateRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('cusId' in changed) applyCusId(changed.cusId ?? '');
  };

  const handleReset = () => {
    cancelApplyCusId();
    form.resetFields();
    reset();
  };

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
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        className="mb-4"
        initialValues={{ status: '' }}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          <Col span={7}>
            <TaskStatusFilter />
          </Col>
          <Col span={7}>
            <TaskCusIdFilter />
          </Col>
          <Col span={7}>
            <TaskDateRangeFilter />
          </Col>
          <Col span={3} className="flex items-center justify-end">
            <Button onClick={handleReset}>Reset</Button>
          </Col>
        </Row>
      </Form>
      <div ref={tableWrapRef}>
        <ResizableTable<Task>
          rowKey="taskId"
          columns={columns}
          storageKey="task-pool"
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
