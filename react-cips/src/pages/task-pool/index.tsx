import type { CSSProperties } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Row } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import type { Task } from '@/types';
import type { TaskSortField, TaskSortOrder } from '@/types/enums';
import { RoutePath } from '@/router/routes';
import useTaskList, { PAGE_SIZE_OPTIONS, type TaskPoolFilterValues } from '@/pages/task-pool/useTaskList';
import ResizableTable from '@/components/ResizableTable';
import {
  TaskCreateTimeRangeFilter,
  TaskIdFilter,
  TaskNameFilter,
  TaskStatusFilter,
  TaskUpdateTimeRangeFilter,
} from '@/components/FormItem';
import { checkerId, createTime, makerId, taskId, taskName, taskStatus, updateTime } from '@/components/TableColumn';

// 279px = Content 上下内边距 48 + 筛选区 72 + 筛选区下边距 16
// + 表头 55 + 分页器上边距 16 + small 分页器 24 + 安全余量 8。
// 分页器下边距已由全局 antd 5 覆盖归零，因此不参与扣减。
const TABLE_BODY_HEIGHT = 'calc(100vh - 239px)';

/** 任务池查询与列表页面。 */
const TaskPool = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<TaskPoolFilterValues>();
  const { tasks, total, loading, current, pageSize, setCurrent, setPageSize, setSort, query, reset } = useTaskList();

  /** 提交任务筛选条件。 */
  const handleQuery = (values: TaskPoolFilterValues) => {
    query(values);
  };

  /** 重置筛选表单和列表查询状态。 */
  const handleReset = () => {
    form.resetFields();
    reset();
  };

  /** 将表格排序状态转换为任务查询排序条件。 */
  const handleTableChange: NonNullable<TableProps<Task>['onChange']> = (...args) => {
    const [, , sorter, extra] = args;
    if (extra.action !== 'sort') return;

    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter.field === 'string' ? activeSorter.field : undefined;
    const isSortableField =
      field === 'taskId' || field === 'taskName' || field === 'createTime' || field === 'updateTime';
    const order: TaskSortOrder | undefined = activeSorter.order ?? undefined;
    setSort(isSortableField ? (field as TaskSortField) : undefined, order);
  };

  /** 打开指定任务的详情页。 */
  const openDetail = (record: Task) =>
    navigate(generatePath(RoutePath.TaskDetail, { taskId: encodeURIComponent(record.taskId) }));

  const columns: TableColumnsType<Task> = [
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
        <Button color='primary' variant='text' size='small' onClick={() => openDetail(record)}>
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
        onFinish={handleQuery}
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
          <Col span={8} className='ml-auto flex items-center justify-end'>
            <Button htmlType='submit' color='primary' variant='solid'>
              Query
            </Button>
            <Button htmlType='button' className='ml-2' onClick={handleReset}>
              Reset
            </Button>
          </Col>
        </Row>
      </Form>
      <ResizableTable<Task>
        className={`task-pool-table${tasks.length === 0 ? ' task-pool-table-empty' : ''}`}
        style={{ '--task-pool-table-body-height': TABLE_BODY_HEIGHT } as CSSProperties}
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
          pageSizeOptions: PAGE_SIZE_OPTIONS,
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
  );
};

export default TaskPool;
