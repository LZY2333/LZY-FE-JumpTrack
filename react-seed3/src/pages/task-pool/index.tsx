import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Col, DatePicker, Form, Input, Modal, Row, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Moment } from 'moment';
import { debounce } from 'lodash';
import useUserStore from '@/store/useUserStore';
import { TaskStatus, Role } from '@/types/enums';
import type { Task } from '@/types';
import { getDueTasks, getTasks } from '@/api/tasks';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.Cancelled]: 'default',
  [TaskStatus.Submitted]: 'purple',
  [TaskStatus.Returned]: 'orange',
  [TaskStatus.Approved]: 'green',
};

const ALERT_KEY = 'cies_expiry_alerted';
// 表头 + 分页器 + 底部留白的高度：scroll.y = 视窗高度 - 表格顶部 - 此值。
// 表格随数据增高，最多到 scroll.y 后内部滚动，分页器始终落在视窗内。
const TABLE_RESERVE = 140;

export default function TaskPool() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);
  const [alertTasks, setAlertTasks] = useState<Task[]>([]);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(400);

  // 客户名搜索防抖：输入即时回显，300ms 后才真正发起查询并回到第一页
  const applyName = useMemo(
    () => debounce((v: string) => { setNameQuery(v); setPage(1); }, 300),
    [],
  );
  useEffect(() => () => applyName.cancel(), [applyName]);

  useEffect(() => {
    setLoading(true);
    getTasks({
      page,
      pageSize,
      status: statusFilter || undefined,
      customerName: nameQuery.trim() || undefined,
      dateFrom: dateRange?.[0].format('YYYY-MM-DD'),
      dateTo: dateRange?.[1].format('YYYY-MM-DD'),
    })
      .then(res => {
        setTasks(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter, nameQuery, dateRange]);

  // 到期提醒独立于分页，每个会话仅弹一次
  useEffect(() => {
    if (sessionStorage.getItem(ALERT_KEY)) return;
    getDueTasks().then(due => {
      if (due.length) setAlertTasks(due);
    });
  }, []);

  // 以表格相对视窗的位置计算可用高度，避免依赖父级高度链（KeepAlive 缓存下更稳）。
  // ResizeObserver 保证表格挂载/重新激活后再取一次准确的位置。
  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const update = () => {
      const top = el.getBoundingClientRect().top;
      setScrollY(Math.max(200, window.innerHeight - top - TABLE_RESERVE));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

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
      <Form layout="horizontal" labelAlign="left" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }} className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="状态" className="mb-0">
              <Select
                value={statusFilter}
                onChange={v => { setStatusFilter(v); setPage(1); }}
                className="w-full"
                options={[
                  { value: '', label: '全部状态' },
                  { value: TaskStatus.Pending, label: 'Pending' },
                  { value: TaskStatus.Cancelled, label: 'Cancelled' },
                  { value: TaskStatus.Submitted, label: 'Submitted' },
                  { value: TaskStatus.Returned, label: 'Returned' },
                  { value: TaskStatus.Approved, label: 'Approved' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="客户名称" className="mb-0">
              <Input
                allowClear
                placeholder="按客户名称筛选"
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); applyName(e.target.value); }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="发起日期" className="mb-0">
              <DatePicker.RangePicker
                className="w-full"
                value={dateRange}
                onChange={v => { setDateRange(v?.[0] && v?.[1] ? [v[0] as Moment, v[1] as Moment] : null); setPage(1); }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div ref={tableWrapRef}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          onRow={record => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
          scroll={{ y: scrollY }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      </div>
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
    </div>
  );
}
