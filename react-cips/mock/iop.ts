import type { IopTaskResponse } from '@/api/iop/iop';
import {
  ApprovalYesNo,
  IOP_TASK_TYPE_LABELS,
  IopTaskNode,
  IopTaskType,
  MessageBusinessType,
  MessageDirection,
  ResCode,
} from '@/types/enums';

interface MockRequestOption {
  /** 当前工作流任务查询 URL。 */
  url: string;
}

interface MockBodyOption<T> {
  /** Mock POST 请求体。 */
  body: T;
}

/** 在开发 Mock 模式按 ST10～ST16 工作流任务编号前缀返回任务表数据。 */
const handleIopTaskQuery = ({ url }: MockRequestOption) => {
  const iopWfTaskId = getLastPathSegment(url);
  const taskFlowNo = iopWfTaskId.split('-')[0] as IopTaskType;
  const taskIndex = Object.values(IopTaskType).indexOf(taskFlowNo);

  if (taskIndex < 0) {
    return { returnCode: 'ERR0404', errorMsg: 'IOP task was not found.' };
  }

  const body: IopTaskResponse = {
    taskId: `TASK20261231${String(taskIndex + 1).padStart(6, '0')}`,
    taskFlowNo,
    taskFlowName: IOP_TASK_TYPE_LABELS[taskFlowNo],
    busRefNo: 'CIPSIN20260822000001',
    taskHoldStatus: 'N',
    taskNode: resolveTaskNode(iopWfTaskId),
    iopWfTaskId,
    businessType: MessageBusinessType.Payment,
    msgDirection: MessageDirection.In,
    rejectReason: iopWfTaskId.includes('REWORK') ? 'Message information is incomplete.' : null,
  };

  return { returnCode: ResCode.Success, body };
};

/** 从任务查询 URL 获取工作流任务编号。 */
const getLastPathSegment = (url: string) => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] ?? '');
};

/** 根据 Mock 工作流任务编号切换经办、退回和审批页面状态。 */
const resolveTaskNode = (iopWfTaskId: string) => {
  if (iopWfTaskId.includes('APPROVED')) return IopTaskNode.Approved;
  if (iopWfTaskId.includes('CHECKER1')) return IopTaskNode.Checker1Stage;
  if (iopWfTaskId.includes('REWORK')) return IopTaskNode.MakerRework;
  return IopTaskNode.MakerStage;
};

/** 校验 IOP Task 操作公共参数。 */
const handleTaskAction = ({ body }: MockBodyOption<{ msgId?: string; taskId?: string }>) =>
  body?.msgId && body.taskId
    ? { returnCode: ResCode.Success }
    : { returnCode: 'ERR0400', errorMsg: 'Message ID and task ID are required.' };

export default [
  {
    url: '/cips/api/task-info/getbywfid/:iopWfTaskId',
    method: 'get',
    response: handleIopTaskQuery,
  },
  {
    url: '/cips/api/task-info/manual-entry/update',
    method: 'post',
    response: ({ body }: MockBodyOption<{ msgContent?: string }>) =>
      body?.msgContent
        ? { returnCode: ResCode.Success }
        : { returnCode: 'ERR0400', errorMsg: 'Raw message content is required.' },
  },
  {
    url: '/cips/api/task-info/manual-entry/redo',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/cips/api/task-info/manual-entry/confirm',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/cips/api/task-info/approval',
    method: 'post',
    response: ({ body }: MockBodyOption<{ next?: ApprovalYesNo; rejectReason?: string }>) => {
      if (!Object.values(ApprovalYesNo).includes(body?.next as ApprovalYesNo)) {
        return { returnCode: 'ERR0400', errorMsg: 'Approval result is required.' };
      }
      if (body.next === ApprovalYesNo.No && !body.rejectReason?.trim()) {
        return { returnCode: 'ERR0400', errorMsg: 'Reject reason is required.' };
      }
      return { returnCode: ResCode.Success };
    },
  },
];
