import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Row } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { Moment } from 'moment';
import { useDebounceFn } from 'ahooks';
import type { Task } from '@/types';
import type { TaskSortField, TaskSortOrder } from '@/api/tasks';
import { RoutePath } from '@/router/routes';
import useTaskList from '@/pages/task-pool/useTaskList';
import useTableScrollY from '@/pages/task-pool/useTableScrollY';
import ResizableTable from '@/components/ResizableTable';
import {
  TaskStatusFilter,
  TaskCusIdFilter,
  TaskIdFilter,
  TaskCreateTimeRangeFilter,
  TaskTransactionTimeRangeFilter,
  TaskUpdateTimeRangeFilter,
} from '@/components/FormItem';
import {
  taskId,
  tranType,
  cusId,
  customerName,
  makerId,
  checkerId,
  createTime,
  transactionTime,
  updateTime,
  taskStatus,
} from '@/components/TableColumn/task';

interface FilterValues {
  status: string;
  taskId: string;
  cusId: string;
  createTimeRange: [Moment, Moment] | null;
  transactionTimeRange: [Moment, Moment] | null;
  updateTimeRange: [Moment, Moment] | null;
}

export default function TaskPool() {
  const navigate = useNavigate();
  const {
    tasks,
    total,
    loading,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    changeStatus,
    changeTaskId,
    changeCusId,
    changeCreateTimeRange,
    changeTransactionTimeRange,
    changeUpdateTimeRange,
    changeSort,
    reset,
  } = useTaskList();
  const [form] = Form.useForm();
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const scrollY = useTableScrollY(tableWrapRef);

  // 文本筛选防抖：输入即时回显由 Form 受控管理，300ms 后才把值推给查询
  const { run: applyCusId, cancel: cancelApplyCusId } = useDebounceFn((value: string) => changeCusId(value), {
    wait: 300,
  });
  const { run: applyTaskId, cancel: cancelApplyTaskId } = useDebounceFn((value: string) => changeTaskId(value), {
    wait: 300,
  });

  // 状态/日期即时查询，文本输入走防抖；字段变更由 Form 统一分发
  const handleValuesChange = (changed: Partial<FilterValues>) => {
    if ('status' in changed) changeStatus(changed.status ?? '');
    if ('createTimeRange' in changed) {
      const range = changed.createTimeRange;
      changeCreateTimeRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('transactionTimeRange' in changed) {
      const range = changed.transactionTimeRange;
      changeTransactionTimeRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('updateTimeRange' in changed) {
      const range = changed.updateTimeRange;
      changeUpdateTimeRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('taskId' in changed) applyTaskId(changed.taskId ?? '');
    if ('cusId' in changed) applyCusId(changed.cusId ?? '');
  };

  const handleReset = () => {
    cancelApplyCusId();
    cancelApplyTaskId();
    form.resetFields();
    reset();
  };

  const handleTableChange: NonNullable<TableProps<Task>['onChange']> = (_, __, sorter, extra) => {
    if (extra.action !== 'sort') return;
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter.field === 'string' ? activeSorter.field : undefined;
    const isSortableField =
      field === 'taskId' || field === 'createTime' || field === 'transactionTime' || field === 'updateTime';
    const order: TaskSortOrder | undefined =
      activeSorter.order === 'ascend' ? 'asc' : activeSorter.order === 'descend' ? 'desc' : undefined;
    changeSort(isSortableField ? (field as TaskSortField) : undefined, order);
  };

  const openDetail = (record: Task) =>
    navigate(generatePath(RoutePath.TaskDetail, { taskId: encodeURIComponent(record.taskId) }));

  const columns: ColumnsType<Task> = [
    taskId,
    tranType,
    cusId,
    customerName,
    makerId,
    checkerId,
    createTime,
    transactionTime,
    updateTime,
    taskStatus,
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Button type='link' size='small' className='px-0' onClick={() => openDetail(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className='animate-fade-in'>
      <div className='mb-2 text-xs text-gray-400'>
        Double-click a row, or click &quot;View&quot; to open task details
      </div>
      <Form
        form={form}
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        className='mb-4'
        initialValues={{ status: '' }}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          <Col span={8} className='mb-2'>
            <TaskIdFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <TaskCusIdFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <TaskStatusFilter />
          </Col>
          <Col span={8}>
            <TaskCreateTimeRangeFilter />
          </Col>
          <Col span={8}>
            <TaskTransactionTimeRangeFilter />
          </Col>
          <Col span={8}>
            <TaskUpdateTimeRangeFilter />
          </Col>
          <Col span={24} className='mt-2 flex items-center justify-end'>
            <Button onClick={handleReset}>Reset</Button>
          </Col>
        </Row>
      </Form>
      <div
        ref={tableWrapRef}
        className='task-pool-table'
        style={{ '--task-pool-table-body-height': `${scrollY}px` } as CSSProperties}
      >
        <ResizableTable<Task>
          rowKey='taskId'
          columns={columns}
          storageKey='task-pool'
          dataSource={tasks}
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
          scroll={{ y: scrollY }}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `Total ${count}`,
            onChange: (nextCurrent, ps) => {
              setCurrent(nextCurrent);
              setPageSize(ps);
            },
          }}
        />
      </div>
    </div>
  );
}
