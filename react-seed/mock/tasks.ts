import type { TaskQuery, TaskSortField, TaskSortOrder, TaskUpdate } from '@/api/tasks';
import type { Task } from '@/types';
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

/** 模块级数据在开发服务器存活期间保持状态，用于演示查询、详情和状态流转。 */
const tasks: Task[] = Array.from({ length: 12 }, (_, index) => {
  const taskId = `T${String(index + 1).padStart(4, '0')}`;
  const taskStatus = STATUSES[index % STATUSES.length];
  const hasMaker = taskStatus !== TaskStatus.Pending;
  const hasChecker = taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved;

  return {
    taskId,
    taskName: `Example Task ${index + 1}`,
    description: `Editable description for example task ${index + 1}.`,
    taskStatus,
    makerId: hasMaker ? MAKER_USER_IDS[index % MAKER_USER_IDS.length] : '',
    checkerId: hasChecker ? CHECKER_USER_IDS[index % CHECKER_USER_IDS.length] : '',
    createTime: `2026-06-${String(12 - index).padStart(2, '0')}`,
    updateTime: `2026-07-${String(12 - index).padStart(2, '0')}`,
    taskRemark: taskStatus === TaskStatus.Returned ? 'Please update the task description.' : '',
  };
});

const cloneTask = (task: Task): Task => ({ ...task });

const lastPathSegment = (url: string) => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '');
};

const findTask = (taskId: string) => tasks.find((task) => task.taskId === taskId);

const notFound = (taskId: string) => ({
  returnCode: 'ERR0404',
  errorMsg: `Task ${taskId} not found`,
});

interface MockTaskQuery extends Omit<TaskQuery, 'current' | 'pageSize'> {
  current?: number | string;
  pageSize?: number | string;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

export default [
  {
    url: '/api/example/v1/tasks/query',
    method: 'post',
    response: (option: { body: MockTaskQuery }) => {
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
      let list = [...tasks];
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
    url: '/api/example/v1/tasks/:taskId',
    method: 'get',
    timeout: 500,
    response: (option: { url: string }) => {
      const taskId = lastPathSegment(option.url);
      const task = findTask(taskId);
      return task ? { returnCode: ResCode.Success, body: cloneTask(task) } : notFound(taskId);
    },
  },
  {
    url: '/api/example/v1/tasks/:taskId',
    method: 'post',
    response: (option: { url: string; body: TaskUpdate }) => {
      const taskId = lastPathSegment(option.url);
      const task = findTask(taskId);
      if (!task) return notFound(taskId);

      const { taskStatus, operatorId, taskName, description, taskRemark } = option.body || {};
      if (taskStatus === TaskStatus.Submitted && (!taskName || description === undefined)) {
        return { returnCode: 'ERR0400', errorMsg: 'Submitting a task requires task fields' };
      }
      if ((taskStatus === TaskStatus.Returned || taskStatus === TaskStatus.Approved) && task.makerId === operatorId) {
        return { returnCode: 'ERR0403', errorMsg: 'Maker and Checker must be different users' };
      }

      task.taskStatus = taskStatus;
      task.updateTime = new Date().toISOString().slice(0, 10);
      if (taskStatus === TaskStatus.Submitted) {
        task.taskName = taskName!;
        task.description = description!;
        task.makerId = operatorId;
        task.checkerId = '';
        task.taskRemark = '';
      } else if (taskStatus === TaskStatus.Returned) {
        task.checkerId = operatorId;
        task.taskRemark = taskRemark || '';
      } else if (taskStatus === TaskStatus.Approved) {
        task.checkerId = operatorId;
      } else if (taskStatus === TaskStatus.Cancelled) {
        task.makerId = operatorId;
      }

      return { returnCode: ResCode.Success, body: null };
    },
  },
];
