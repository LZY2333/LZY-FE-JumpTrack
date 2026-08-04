import type { TaskPageData, TaskSortField, TaskSortOrder, TaskStatusChange } from '@/api/tasks';
import type { Attachment, Customer, Task } from '@/types';
import { ResCode, Role, TaskStatus, TranType } from '@/types/enums';
import { mockCustomers } from './customer';
import { mockUsers } from './users';

const cloneAttachment = (attachment: Attachment): Attachment => ({ ...attachment });

const cloneCustomer = (customer: Customer): Customer => ({
  ...customer,
  cusPrmAct: [...customer.cusPrmAct],
  investmentAccounts:
    customer.investmentAccounts == null
      ? customer.investmentAccounts
      : customer.investmentAccounts.map((account) => ({ ...account })),
  withdrawnIntr: !customer.withdrawnIntr ? customer.withdrawnIntr : { ...customer.withdrawnIntr },
  transferIntr: !customer.transferIntr ? customer.transferIntr : { ...customer.transferIntr },
});

const attachmentsFor = (taskId: string): Attachment[] => [
  {
    fileId: `${taskId}-1`,
    fileName: `Cover_Letter_${taskId}.pdf`,
    fileSize: '102400',
    createTime: '2026-06-01 10:00:00',
    createUser: 'U001',
  },
  {
    fileId: `${taskId}-2`,
    fileName: `Statement_${taskId}.pdf`,
    fileSize: '204800',
    createTime: '2026-06-01 10:00:00',
    createUser: 'U001',
  },
  {
    fileId: `${taskId}-3`,
    fileName: `Transaction_${taskId}.pdf`,
    fileSize: '51200',
    createTime: '2026-06-01 10:00:00',
    createUser: 'U001',
  },
];

const STATUSES = [
  TaskStatus.Pending,
  TaskStatus.Submitted,
  TaskStatus.Returned,
  TaskStatus.Approved,
  TaskStatus.Cancelled,
];

let attachmentSequence = 0;

/**
 * 模块级可变数据在 dev server 进程存活期间持久：
 * - Task 保存任务表、申报交易表与客户信息联查后的列表字段；
 * - 客户变更快照及附件分别保存在任务关联集合中。
 */
export const mockTasks: Task[] = Array.from({ length: 38 }, (_, index) => {
  const taskId = `T${String(index + 1).padStart(4, '0')}`;
  const taskStatus = STATUSES[index % STATUSES.length];
  const makerUsers = mockUsers.filter((user) => user.roles.includes(Role.Maker));
  const checkerUsers = mockUsers.filter((user) => user.roles.includes(Role.Checker));
  const maker = makerUsers[index % makerUsers.length];
  const checker = checkerUsers[index % checkerUsers.length];
  const createTime = `2026-06-${String(28 - (index % 28)).padStart(2, '0')}`;
  const transactionTime = `2026-05-${String(28 - (index % 28)).padStart(2, '0')}`;
  const updateTime = `2026-07-${String(27 - (index % 27)).padStart(2, '0')}`;
  const customer = mockCustomers[index % mockCustomers.length];
  const hasMaker = taskStatus !== TaskStatus.Pending;
  const hasChecker = taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved;

  return {
    taskId,
    tranType: TranType.DailyReport,
    taskStatus,
    cusId: customer.cusId,
    cusEnName: customer.cusEnName,
    cusCnName: customer.cusCnName,
    makerId: hasMaker ? maker.id : '',
    checkerId: hasChecker ? checker.id : '',
    createTime,
    transactionTime,
    updateTime,
    taskRemark: taskStatus === TaskStatus.Returned ? 'Please verify the updated customer information.' : '',
  };
});

/** 每个任务的附件元数据；附件二进制内容由下载接口单独返回。 */
export const mockAttachmentsByTaskId = new Map<string, Attachment[]>(
  mockTasks.map((task) => [task.taskId, attachmentsFor(task.taskId)]),
);

/**
 * 客户变更接口返回完整 Customer，而不是差异 JSON。
 * Returned 示例修改 bankCusRef，用于后续验证重新进入明细页后的字段高亮。
 */
export const mockCustomerChangesByTaskId = new Map<string, Customer>(
  mockTasks.flatMap((task) => {
    const hasSavedChange =
      task.taskStatus === TaskStatus.Submitted ||
      task.taskStatus === TaskStatus.Returned ||
      task.taskStatus === TaskStatus.Approved;
    if (!hasSavedChange) return [];

    const customer = mockCustomers.find((item) => item.cusId === task.cusId);
    if (!customer) return [];

    const customerChange = cloneCustomer(customer);
    if (task.taskStatus === TaskStatus.Returned) {
      customerChange.bankCusRef = `CIES2.0:DRAFT-${task.taskId}`;
    }
    return [[task.taskId, customerChange] as const];
  }),
);

const pathSegments = (url: string): string[] =>
  url
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

const lastPathSegment = (url: string): string => {
  const segments = pathSegments(url);
  return segments[segments.length - 1] || '';
};

// 新接口中的 taskId 和 fileName 均位于路径末段。
const taskIdFromUrl = (url: string): string => lastPathSegment(url);

const fileNameFromUrl = (url: string): string => lastPathSegment(url);

const findTask = (taskId: string) => mockTasks.find((task) => task.taskId === taskId);

const findAttachment = (fileName: string) => {
  for (const attachments of mockAttachmentsByTaskId.values()) {
    const attachment = attachments.find((item) => item.fileName === fileName);
    if (attachment) return attachment;
  }
  return undefined;
};

const notFound = (resource: string, id: string) => ({
  returnCode: 'ERR0404',
  errorMsg: `${resource} ${id} not found`,
});

interface TasksQuery {
  current?: number | string;
  pageSize?: number | string;
  status?: string;
  taskId?: string;
  cusId?: string;
  createTimeFrom?: string;
  createTimeTo?: string;
  transactionTimeFrom?: string;
  transactionTimeTo?: string;
  updateTimeFrom?: string;
  updateTimeTo?: string;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

export default [
  {
    url: '/api/cies/v1/task/getTasks',
    method: 'post',
    response: (opt: { body: TasksQuery }) => {
      const {
        current = 1,
        pageSize = 10,
        status,
        taskId,
        cusId,
        createTimeFrom,
        createTimeTo,
        transactionTimeFrom,
        transactionTimeTo,
        updateTimeFrom,
        updateTimeTo,
        sortField,
        sortOrder,
      } = opt.body || {};
      let list = [...mockTasks];
      if (status) list = list.filter((task) => task.taskStatus === status);
      if (taskId) {
        const keyword = taskId.trim().toLowerCase();
        list = list.filter((task) => task.taskId.toLowerCase().includes(keyword));
      }
      if (cusId) {
        const keyword = cusId.trim().toLowerCase();
        list = list.filter((task) => task.cusId.toLowerCase().includes(keyword));
      }
      if (createTimeFrom) list = list.filter((task) => task.createTime.slice(0, 10) >= createTimeFrom);
      if (createTimeTo) list = list.filter((task) => task.createTime.slice(0, 10) <= createTimeTo);
      if (transactionTimeFrom) list = list.filter((task) => task.transactionTime >= transactionTimeFrom);
      if (transactionTimeTo) list = list.filter((task) => task.transactionTime <= transactionTimeTo);
      if (updateTimeFrom) list = list.filter((task) => task.updateTime.slice(0, 10) >= updateTimeFrom);
      if (updateTimeTo) list = list.filter((task) => task.updateTime.slice(0, 10) <= updateTimeTo);
      if (sortField && sortOrder) {
        const direction = sortOrder === 'asc' ? 1 : -1;
        list.sort((left, right) => left[sortField].localeCompare(right[sortField]) * direction);
      }

      const currentPage = Number(current);
      const size = Number(pageSize);
      return {
        returnCode: ResCode.Success,
        body: {
          list: list.slice((currentPage - 1) * size, currentPage * size),
          current: currentPage,
          pageSize: size,
          total: list.length,
        },
      };
    },
  },
  {
    // 明细页聚合查询：任务、原始客户、完整客户变更快照和附件元数据一次返回。
    url: '/api/cies/v1/task/detail/:taskId',
    method: 'get',
    response: (opt: { url: string }) => {
      const taskId = taskIdFromUrl(opt.url);
      const task = findTask(taskId);
      if (!task) return notFound('Task', taskId);

      const customer = mockCustomers.find((item) => item.cusId === task.cusId);
      if (!customer) return notFound('Customer', task.cusId);

      const customerChange = mockCustomerChangesByTaskId.get(taskId);
      const body: TaskPageData = {
        task: { ...task },
        customer: cloneCustomer(customer),
        customerChange: customerChange ? cloneCustomer(customerChange) : null,
        attachments: (mockAttachmentsByTaskId.get(taskId) || []).map(cloneAttachment),
      };
      return { returnCode: ResCode.Success, body };
    },
  },
  {
    url: '/api/cies/v1/task/customer-change/:taskId',
    method: 'get',
    response: (opt: { url: string }) => {
      const taskId = taskIdFromUrl(opt.url);
      const customerChange = mockCustomerChangesByTaskId.get(taskId);
      if (!findTask(taskId)) return notFound('Task', taskId);

      return {
        returnCode: ResCode.Success,
        body: customerChange ? cloneCustomer(customerChange) : null,
      };
    },
  },
  {
    url: '/api/cies/v1/task/attachments/:taskId',
    method: 'get',
    response: (opt: { url: string }) => {
      const taskId = taskIdFromUrl(opt.url);
      if (!findTask(taskId)) return notFound('Task', taskId);

      return {
        returnCode: ResCode.Success,
        body: (mockAttachmentsByTaskId.get(taskId) || []).map(cloneAttachment),
      };
    },
  },
  {
    url: '/api/cies/v1/task/:taskId',
    method: 'get',
    response: (opt: { url: string }) => {
      const taskId = taskIdFromUrl(opt.url);
      const task = findTask(taskId);
      return task ? { returnCode: ResCode.Success, body: { ...task } } : notFound('Task', taskId);
    },
  },
  {
    // Mock 不存真实上传文件，只保存前端提交的文件名和大小，并生成附件 ID。
    url: '/api/cies/v1/task/attachment/:taskId',
    method: 'post',
    response: (opt: { url: string; body: { fileName: string; fileSize: string } }) => {
      const taskId = taskIdFromUrl(opt.url);
      if (!findTask(taskId)) return notFound('Task', taskId);

      const { fileName, fileSize } = opt.body || {};
      const timestamp = Date.now();
      attachmentSequence += 1;
      const attachment: Attachment = {
        fileId: `${taskId}-${timestamp}-${attachmentSequence}`,
        fileName: fileName || 'unnamed',
        fileSize: fileSize || '0',
        createTime: new Date(timestamp).toISOString().slice(0, 19).replace('T', ' '),
        createUser: 'U001',
      };
      const attachments = mockAttachmentsByTaskId.get(taskId) || [];
      mockAttachmentsByTaskId.set(taskId, [...attachments, attachment]);
      return { returnCode: ResCode.Success, body: cloneAttachment(attachment) };
    },
  },
  {
    // 下载接口返回原始二进制响应，不使用 ApiResult 包装。
    url: '/api/cies/v1/task/attachment/download/:fileName',
    method: 'get',
    rawResponse: (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse) => {
      const fileName = fileNameFromUrl(request.url || '');
      const attachment = findAttachment(fileName);
      if (!attachment) {
        response.statusCode = 404;
        response.end('Attachment not found');
        return;
      }

      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
      );
      response.end(Buffer.from(`Mock file content for ${attachment.fileName}\n`, 'utf8'));
    },
  },
  {
    /**
     * 统一状态变更：
     * - submit 保存完整 customerChange 与附件列表；
     * - return 保留变更快照并记录退回原因；
     * - approve 将任务变更快照覆盖到客户主数据。
     */
    url: '/api/cies/v1/task/status',
    method: 'post',
    response: (opt: { body: TaskStatusChange }) => {
      const { taskId, taskStatus, makerId, checkerId, taskRemark, payload } = opt.body || {};
      const task = findTask(taskId);
      if (!task) return notFound('Task', taskId);
      if (taskStatus === TaskStatus.Submitted && !payload) {
        return { returnCode: 'ERR0400', errorMsg: 'Submitting a task requires payload' };
      }
      if (
        (taskStatus === TaskStatus.Submitted || taskStatus === TaskStatus.Cancelled) &&
        task.taskStatus === TaskStatus.Returned &&
        task.makerId &&
        task.makerId !== makerId
      ) {
        return { returnCode: 'ERR0403', errorMsg: 'Returned task must be handled by its assigned Maker' };
      }
      if (
        (taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved) &&
        task.makerId &&
        task.makerId === checkerId
      ) {
        return { returnCode: 'ERR0403', errorMsg: 'Maker and Checker must be different users' };
      }
      if (taskStatus === TaskStatus.Approved && !mockCustomerChangesByTaskId.has(taskId)) {
        return { returnCode: 'ERR0409', errorMsg: 'Task has no saved customer change to approve' };
      }

      task.taskStatus = taskStatus;
      task.updateTime = new Date().toISOString().slice(0, 10);
      if (makerId) task.makerId = makerId;
      if (checkerId) task.checkerId = checkerId;
      if (taskStatus === TaskStatus.Returned) {
        task.taskRemark = taskRemark || '';
      } else if (taskStatus === TaskStatus.Submitted) {
        task.checkerId = '';
        task.taskRemark = '';
      }

      if (payload) {
        mockCustomerChangesByTaskId.set(taskId, cloneCustomer(payload.customerChange));
        mockAttachmentsByTaskId.set(taskId, payload.attachments.map(cloneAttachment));
      }

      if (taskStatus === TaskStatus.Approved) {
        const customer = mockCustomers.find((item) => item.cusId === task.cusId);
        const customerChange = mockCustomerChangesByTaskId.get(taskId);
        if (customer && customerChange) {
          Object.assign(customer, cloneCustomer(customerChange));
        }
      }

      return { returnCode: ResCode.Success, body: null };
    },
  },
];
