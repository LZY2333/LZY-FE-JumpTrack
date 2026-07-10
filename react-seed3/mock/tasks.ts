import { ResCode, Role, TaskStatus, TaskType } from '@/types/enums';
import type { Attachment, Customer, Task } from '@/types';
import { mockCustomers } from './customer';
import { mockUsers } from './users';

const attachmentsFor = (id: string): Attachment[] => [
  {
    fileId: `${id}-1`,
    fileName: `Cover_Letter_${id}.pdf`,
    filePath: `/attachments/${id}/1`,
    fileSize: '102400',
    createTime: '2026-06-01 10:00:00',
    createTellerId: 'U001',
  },
  {
    fileId: `${id}-2`,
    fileName: `Statement_${id}.pdf`,
    filePath: `/attachments/${id}/2`,
    fileSize: '204800',
    createTime: '2026-06-01 10:00:00',
    createTellerId: 'U001',
  },
  {
    fileId: `${id}-3`,
    fileName: `Transaction_${id}.pdf`,
    filePath: `/attachments/${id}/3`,
    fileSize: '51200',
    createTime: '2026-06-01 10:00:00',
    createTellerId: 'U001',
  },
];

const STATUSES = [
  TaskStatus.Pending,
  TaskStatus.Submitted,
  TaskStatus.Returned,
  TaskStatus.Approved,
  TaskStatus.Cancelled,
];

// Returned 状态的任务演示 newValue：maker 之前保存过的草稿改动（相对 customer 接口的差异字段，不含附件），
// 用于验证「重新进入详情页时，草稿字段高亮」的效果
const demoNewValue = () =>
  JSON.stringify({
    bankCusRef: 'CIES2.0:DRAFT-001',
  });

// 模块级可变数组：Node.js 模块单例，dev server 进程存活期间状态持久，mock 接口直接修改此数组。
// 生成 38 条用于演示分页：发起日期递减，覆盖全部状态；本地 demo 数据均关联同一个 mock 客户 C0001。
// Maker/Checker 信息按状态区分：Pending 尚未被 maker 领取，故无 maker；Submitted 已提交但未经 checker 处理，
// 故无 checker；Returned/Approved 均已被 checker 处理过，maker/checker 均有；Cancelled 由 maker 自行撤销，只有 maker。
export const mockTasks: Task[] = Array.from({ length: 38 }, (_, i) => {
  const id = `T${String(i + 1).padStart(4, '0')}`;
  const status = STATUSES[i % STATUSES.length];
  const makerUsers = mockUsers.filter((user) => user.roles.includes(Role.Maker));
  const checkerUsers = mockUsers.filter((user) => user.roles.includes(Role.Checker));
  const maker = makerUsers[i % makerUsers.length];
  const checker = checkerUsers[i % checkerUsers.length];
  const createDate = `2026-06-${String(28 - (i % 28)).padStart(2, '0')}`;
  const hasMaker = status !== TaskStatus.Pending;
  const hasChecker = status === TaskStatus.Returned || status === TaskStatus.Approved;
  return {
    taskId: id,
    taskName: `DailyReport-${createDate.replace(/-/g, '')}`,
    taskType: TaskType.DailyReport,
    taskStatus: status,
    cusId: 'C0001',
    newValue: status === TaskStatus.Returned ? demoNewValue() : '',
    inputId: hasMaker ? maker.id : '',
    inputName: hasMaker ? maker.name : '',
    inputTime: hasMaker ? createDate : '',
    inputBrNo: hasMaker ? '001' : '',
    inputBrName: hasMaker ? 'Central Branch' : '',
    authoriserId: hasChecker ? checker.id : '',
    authoriserName: hasChecker ? checker.name : '',
    authoriserTime: hasChecker ? createDate : '',
    authoriserBrNo: hasChecker ? '001' : '',
    authoriserBrName: hasChecker ? 'Central Branch' : '',
    createDate,
    lastUpdateTime: createDate,
    remarkMsg: '',
    attachments: attachmentsFor(id),
  };
});

// vite-plugin-mock v2 不在 response 回调中暴露路径参数，只能从 URL 字符串手动解析；
// /api/task/:id 与 /api/task/{submit,return,approve}/:id 的 id 均为最后一段
function lastSeg(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// /api/task/:id/attachment 的 id 是倒数第二段
function taskIdFromAttachmentUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 2];
}

interface TasksQuery {
  current?: string;
  pageSize?: string;
  status?: string;
  cusId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default [
  {
    url: '/api/tasks',
    method: 'post',
    response: (opt: { body: TasksQuery }) => {
      const { current = '1', pageSize = '10', status, cusId, dateFrom, dateTo } = opt.body || {};
      let list = mockTasks;
      if (status) list = list.filter((task) => task.taskStatus === status);
      if (cusId) {
        const kw = cusId.trim().toLowerCase();
        list = list.filter((task) => task.cusId.toLowerCase().includes(kw));
      }
      if (dateFrom) list = list.filter((task) => task.createDate >= dateFrom);
      if (dateTo) list = list.filter((task) => task.createDate <= dateTo);
      const currentPage = Number(current);
      const ps = Number(pageSize);
      return {
        returnCode: ResCode.Success,
        body: {
          list: list.slice((currentPage - 1) * ps, currentPage * ps),
          current: currentPage,
          pageSize: ps,
          total: list.length,
        },
      };
    },
  },
  {
    url: '/api/task/:id',
    method: 'get',
    response: (opt: { url: string }) => ({
      returnCode: ResCode.Success,
      body: mockTasks.find((task) => task.taskId === lastSeg(opt.url)),
    }),
  },
  {
    // 附件上传：mock 不落真实文件，仅根据前端提交的文件名/大小生成后端形态的附件记录
    url: '/api/task/:id/attachment',
    method: 'post',
    response: (opt: { url: string; body: { fileName: string; fileSize: string } }) => {
      const taskId = taskIdFromAttachmentUrl(opt.url);
      const { fileName, fileSize } = opt.body || {};
      const attachment: Attachment = {
        fileId: `${taskId}-${Date.now()}`,
        fileName: fileName || 'unnamed',
        filePath: `/attachments/${taskId}/${Date.now()}`,
        fileSize: fileSize || '0',
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        createTellerId: 'U001',
      };
      return { returnCode: ResCode.Success, body: attachment };
    },
  },
  {
    // 统一状态变更：body { id, status, inputId?, authoriserId?, payload? }。
    // submit 时 payload 携带 newValue（表单相对 Customer 的差异 JSON）与 attachments，先存作任务草稿；
    // 只有 approve 时才把 newValue 合并进客户主数据；return 时 newValue 原样保留，供 maker 下次继续编辑。
    url: '/api/task/status',
    method: 'post',
    response: (opt: {
      body: {
        id: string;
        status: TaskStatus;
        inputId?: string;
        authoriserId?: string;
        payload?: { newValue: string; attachments: Attachment[] };
      };
    }) => {
      const { id, status, inputId, authoriserId, payload } = opt.body || {};
      const task = mockTasks.find((item) => item.taskId === id);
      if (task) {
        task.taskStatus = status;
        if (inputId) task.inputId = inputId;
        if (authoriserId) task.authoriserId = authoriserId;
        if (payload) {
          task.newValue = payload.newValue;
          task.attachments = payload.attachments;
        }
        if (status === TaskStatus.Approved) {
          const customer = mockCustomers.find((item) => item.cusId === task.cusId);
          const diff = task.newValue ? (JSON.parse(task.newValue) as Partial<Customer>) : {};
          if (customer) Object.assign(customer, diff);
        }
      }
      return { returnCode: ResCode.Success };
    },
  },
];
