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
import ResizableTable from '@/components/ResizableTable';
import {
  TaskCreateTimeRangeFilter,
  TaskIdFilter,
  TaskNameFilter,
  TaskStatusFilter,
  TaskUpdateTimeRangeFilter,
} from '@/components/FormItem';
import { checkerId, createTime, makerId, taskId, taskName, taskStatus, updateTime } from '@/components/TableColumn/task';

interface FilterValues {
  status: string;
  taskId: string;
  taskName: string;
  createTimeRange: [Moment, Moment] | null;
  updateTimeRange: [Moment, Moment] | null;
}

const TABLE_BODY_HEIGHT = 'calc(100vh - 279px)';

const TaskPool = () => {
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
    changeTaskName,
    changeCreateTimeRange,
    changeUpdateTimeRange,
    changeSort,
    reset,
  } = useTaskList();
  const [form] = Form.useForm();

  const { run: applyTaskId, cancel: cancelApplyTaskId } = useDebounceFn((value: string) => changeTaskId(value), {
    wait: 300,
  });
  const { run: applyTaskName, cancel: cancelApplyTaskName } = useDebounceFn((value: string) => changeTaskName(value), {
    wait: 300,
  });

  const handleValuesChange = (changed: Partial<FilterValues>) => {
    if ('status' in changed) changeStatus(changed.status ?? '');
    if ('createTimeRange' in changed) {
      const range = changed.createTimeRange;
      changeCreateTimeRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('updateTimeRange' in changed) {
      const range = changed.updateTimeRange;
      changeUpdateTimeRange(range?.[0] && range?.[1] ? range : null);
    }
    if ('taskId' in changed) applyTaskId(changed.taskId ?? '');
    if ('taskName' in changed) applyTaskName(changed.taskName ?? '');
  };

  const handleReset = () => {
    cancelApplyTaskId();
    cancelApplyTaskName();
    form.resetFields();
    reset();
  };

  const handleTableChange: NonNullable<TableProps<Task>['onChange']> = (...args) => {
    const [, , sorter, extra] = args;
    if (extra.action !== 'sort') return;

    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter.field === 'string' ? activeSorter.field : undefined;
    const isSortableField = field === 'taskId' || field === 'taskName' || field === 'createTime' || field === 'updateTime';
    let order: TaskSortOrder | undefined;
    if (activeSorter.order === 'ascend') {
      order = 'asc';
    } else if (activeSorter.order === 'descend') {
      order = 'desc';
    }
    changeSort(isSortableField ? (field as TaskSortField) : undefined, order);
  };

  const openDetail = (record: Task) =>
    navigate(generatePath(RoutePath.TaskDetail, { taskId: encodeURIComponent(record.taskId) }));

  const columns: ColumnsType<Task> = [
    taskId,
    taskName,
    makerId,
    checkerId,
    createTime,
    updateTime,
    taskStatus,
    {
      title: 'Action',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button type='text' size='small' className='app-text-button' onClick={() => openDetail(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
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
            <TaskNameFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <TaskStatusFilter />
          </Col>
          <Col span={8}>
            <TaskCreateTimeRangeFilter />
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
        className={`task-pool-table${tasks.length === 0 ? ' task-pool-table-empty' : ''}`}
        style={{ '--task-pool-table-body-height': TABLE_BODY_HEIGHT } as CSSProperties}
      >
        <ResizableTable<Task>
          rowKey='taskId'
          columns={columns}
          storageKey='task-pool'
          dataSource={tasks}
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
          scroll={{ y: TABLE_BODY_HEIGHT }}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (count) => `Total ${count}`,
            onChange: (nextCurrent, nextPageSize) => {
              setCurrent(nextCurrent);
              setPageSize(nextPageSize);
            },
          }}
        />
      </div>
    </div>
  );
};

export default TaskPool;
