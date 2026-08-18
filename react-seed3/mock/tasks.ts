import type { TaskPageData, TaskSortField, TaskSortOrder, TaskStatusChange } from '@/api/tasks';
import type { Attachment, Task } from '@/types';
import { ResCode, TaskStatus } from '@/types/enums';

const STATUSES = [
  TaskStatus.Pending,
  TaskStatus.Submitted,
  TaskStatus.Returned,
  TaskStatus.Approved,
  TaskStatus.Cancelled,
];
const MAKER_USER_IDS = ['U001', 'U003'];
const CHECKER_USER_IDS = ['U002', 'U003'];

const cloneAttachment = (attachment: Attachment): Attachment => ({ ...attachment });
const cloneTask = (task: Task): Task => ({ ...task });

const attachmentsFor = (taskId: string): Attachment[] => [
  {
    fileId: `${taskId}-1`,
    fileName: `Task_Summary_${taskId}.pdf`,
    fileSize: '102400',
    createTime: '2026-06-01 10:00:00',
    createUser: 'U001',
  },
  {
    fileId: `${taskId}-2`,
    fileName: `Supporting_Document_${taskId}.pdf`,
    fileSize: '204800',
    createTime: '2026-06-01 10:00:00',
    createUser: 'U001',
  },
];

/** 模块级可变数据在 dev server 进程存活期间保持状态，用于演示列表、详情与状态流转。 */
export const mockTasks: Task[] = Array.from({ length: 38 }, (_, index) => {
  const taskId = `T${String(index + 1).padStart(4, '0')}`;
  const taskStatus = STATUSES[index % STATUSES.length];
  const hasMaker = taskStatus !== TaskStatus.Pending;
  const hasChecker = taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved;

  return {
    taskId,
    taskName: `Sample Task ${index + 1}`,
    description: `This is the editable description for sample task ${index + 1}.`,
    taskStatus,
    makerId: hasMaker ? MAKER_USER_IDS[index % MAKER_USER_IDS.length] : '',
    checkerId: hasChecker ? CHECKER_USER_IDS[index % CHECKER_USER_IDS.length] : '',
    createTime: `2026-06-${String(28 - (index % 28)).padStart(2, '0')}`,
    updateTime: `2026-07-${String(27 - (index % 27)).padStart(2, '0')}`,
    taskRemark: taskStatus === TaskStatus.Returned ? 'Please verify the task description and submit again.' : '',
  };
});

/** 每个任务的附件元数据；附件二进制内容由下载接口单独返回。 */
export const mockAttachmentsByTaskId = new Map<string, Attachment[]>(
  mockTasks.map((task) => [task.taskId, attachmentsFor(task.taskId)]),
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
  taskName?: string;
  createTimeFrom?: string;
  createTimeTo?: string;
  updateTimeFrom?: string;
  updateTimeTo?: string;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

export default [
  {
    url: '/api/cies/v1/task/getTasks',
    method: 'post',
    response: (option: { body: TasksQuery }) => {
      const {
        current = 1,
        pageSize = 10,
        status,
        taskId,
        taskName,
        createTimeFrom,
        createTimeTo,
        updateTimeFrom,
        updateTimeTo,
        sortField,
        sortOrder,
      } = option.body || {};
      let list = [...mockTasks];
      if (status) list = list.filter((task) => task.taskStatus === status);
      if (taskId) {
        const keyword = taskId.trim().toLowerCase();
        list = list.filter((task) => task.taskId.toLowerCase().includes(keyword));
      }
      if (taskName) {
        const keyword = taskName.trim().toLowerCase();
        list = list.filter((task) => task.taskName.toLowerCase().includes(keyword));
      }
      if (createTimeFrom) list = list.filter((task) => task.createTime >= createTimeFrom);
      if (createTimeTo) list = list.filter((task) => task.createTime <= createTimeTo);
      if (updateTimeFrom) list = list.filter((task) => task.updateTime >= updateTimeFrom);
      if (updateTimeTo) list = list.filter((task) => task.updateTime <= updateTimeTo);
      if (sortField && sortOrder) {
        const direction = sortOrder === 'asc' ? 1 : -1;
        list.sort((left, right) => left[sortField].localeCompare(right[sortField]) * direction);
      }

      const currentPage = Number(current);
      const size = Number(pageSize);
      return {
        returnCode: ResCode.Success,
        body: {
          list: list.slice((currentPage - 1) * size, currentPage * size).map(cloneTask),
          current: currentPage,
          pageSize: size,
          total: list.length,
        },
      };
    },
  },
  {
    url: '/api/cies/v1/task/detail/:taskId',
    method: 'get',
    timeout: 2000,
    response: (option: { url: string }) => {
      const taskId = lastPathSegment(option.url);
      const task = findTask(taskId);
      if (!task) return notFound('Task', taskId);

      const body: TaskPageData = {
        task: cloneTask(task),
        attachments: (mockAttachmentsByTaskId.get(taskId) || []).map(cloneAttachment),
      };
      return { returnCode: ResCode.Success, body };
    },
  },
  {
    url: '/api/cies/v1/task/attachments/:taskId',
    method: 'get',
    response: (option: { url: string }) => {
      const taskId = lastPathSegment(option.url);
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
    response: (option: { url: string }) => {
      const taskId = lastPathSegment(option.url);
      const task = findTask(taskId);
      return task ? { returnCode: ResCode.Success, body: cloneTask(task) } : notFound('Task', taskId);
    },
  },
  {
    /** 下载接口返回原始二进制响应，不使用 ApiResult 包装。 */
    url: '/api/cies/v1/task/attachment/download/:fileName',
    method: 'get',
    rawResponse: (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse) => {
      const fileName = lastPathSegment(request.url || '');
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
    /** 统一状态变更：提交保存简单表单字段，退回保留原因，审批和取消仅改变流程状态。 */
    url: '/api/cies/v1/task/status',
    method: 'post',
    response: (option: { body: TaskStatusChange }) => {
      const { taskId, taskStatus, makerId, checkerId, taskRemark, payload } = option.body || {};
      const task = findTask(taskId);
      if (!task) return notFound('Task', taskId);
      if (taskStatus === TaskStatus.Submitted && !payload) {
        return { returnCode: 'ERR0400', errorMsg: 'Submitting a task requires payload' };
      }
      if (
        (taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved) &&
        task.makerId &&
        task.makerId === checkerId
      ) {
        return { returnCode: 'ERR0403', errorMsg: 'Maker and Checker must be different users' };
      }

      task.taskStatus = taskStatus;
      task.updateTime = new Date().toISOString().slice(0, 10);
      if (makerId) task.makerId = makerId;
      if (checkerId) task.checkerId = checkerId;
      if (payload) {
        task.taskName = payload.taskName;
        task.description = payload.description;
      }
      if (taskStatus === TaskStatus.Returned) {
        task.taskRemark = taskRemark || '';
      } else if (taskStatus === TaskStatus.Submitted) {
        task.checkerId = '';
        task.taskRemark = '';
      }

      return { returnCode: ResCode.Success, body: null };
    },
  },
];
