import type {
  IopDistributeCreationCreateRequest,
  IopDistributeCreationFormResponse,
  IopExceptionOutActionRequest,
  IopInquiryReplyActionRequest,
  IopInquiryReplyCreateRequest,
  IopInquiryReplyFormResponse,
  IopManualEntryRollbackRequest,
  IopManualEntryUpdateRequest,
  IopTaskActionRequest,
  IopTaskResponse,
} from '@/api/iop';
import {
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

/** 在开发 Mock 模式按工作流实例编号中的任务类型和节点标识返回任务表数据。 */
const handleIopTaskQuery = ({ url }: MockRequestOption) => {
  const iopFlwiId = getLastPathSegment(url);
  const taskFlowNo = iopFlwiId.split('-')[0] as IopTaskType;
  const taskIndex = Object.values(IopTaskType).indexOf(taskFlowNo);
  const isInquiryReply = taskFlowNo === IopTaskType.inquiryReply;
  const isExceptionOut = taskFlowNo === IopTaskType.exceptionOut;

  if (taskIndex < 0) {
    return { returnCode: 'ERR0404', errorMsg: 'IOP task was not found.' };
  }

  const body: IopTaskResponse = {
    taskId: `TASK20261231${String(taskIndex + 1).padStart(6, '0')}`,
    taskFlowNo,
    taskFlowName: IOP_TASK_TYPE_LABELS[taskFlowNo],
    busRefNo: resolveBusRefNo(taskFlowNo),
    taskHoldStatus: 'N',
    taskNode: resolveTaskNode(iopFlwiId),
    iopFlwiId,
    businessType: isInquiryReply ? MessageBusinessType.Query : MessageBusinessType.Payment,
    msgDirection: isExceptionOut ? MessageDirection.Out : MessageDirection.In,
    operationCode: isExceptionOut ? resolveExceptionOutOperation(iopFlwiId) : null,
    rejectReason: iopFlwiId.includes('REWORK') ? 'Message information is incomplete.' : null,
  };

  return { returnCode: ResCode.Success, body };
};

/** 从任务查询 URL 获取工作流实例编号。 */
const getLastPathSegment = (url: string) => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] ?? '');
};

/** 根据任务类型返回对应的 Mock 报文编号。 */
const resolveBusRefNo = (taskFlowNo: IopTaskType) => {
  if (taskFlowNo === IopTaskType.exceptionOut) return `CIPS${MessageDirection.Out}20260822000002`;
  if (taskFlowNo === IopTaskType.inquiryReply) return 'CIPSIN20260822000005';
  return 'CIPSIN20260822000001';
};

/** 根据 Mock 工作流实例编号中的节点标识切换页面状态。 */
const resolveTaskNode = (iopFlwiId: string) => {
  if (iopFlwiId.includes('APPROVED')) return IopTaskNode.Approved;
  if (iopFlwiId.includes('CHECKER2')) return IopTaskNode.Checker2Stage;
  if (iopFlwiId.includes('CHECKER1')) return IopTaskNode.Checker1Stage;
  if (iopFlwiId.includes('REWORK')) return IopTaskNode.MakerRework;
  return IopTaskNode.MakerStage;
};

/** 校验 IOP 经办与审批统一请求。 */
const handleTaskAction = ({ body }: MockBodyOption<IopTaskActionRequest>) => {
  const requiredFields = [
    body?.taskId,
    body?.taskNode,
    body?.msgId,
    body?.userId,
    body?.orgId,
    body?.iopWkiId,
    body?.iopNodNam,
    body?.iopWfTaskId,
  ];
  const hasRequiredFields = requiredFields.every(Boolean);

  if (!hasRequiredFields || typeof body.next !== 'boolean') {
    return { returnCode: 'ERR0400', errorMsg: 'IOP task action fields are required.' };
  }
  if (!Object.values(IopTaskNode).includes(body.taskNode)) {
    return { returnCode: 'ERR0400', errorMsg: 'Task node is invalid.' };
  }
  if (!body.next && !body.rejectReason?.trim()) {
    return { returnCode: 'ERR0400', errorMsg: 'Reject reason is required.' };
  }
  return { returnCode: ResCode.Success };
};

/** 校验手工补录经办请求。 */
const handleManualEntryUpdate = ({ body }: MockBodyOption<IopManualEntryUpdateRequest>) => {
  return body?.msgId && body.message?.trim()
    ? { returnCode: ResCode.Success }
    : { returnCode: 'ERR0400', errorMsg: 'Raw message content is required.' };
};

/** 校验手工补录回滚请求。 */
const handleManualEntryRollback = ({ body }: MockBodyOption<IopManualEntryRollbackRequest>) =>
  body?.msgId ? { returnCode: ResCode.Success } : { returnCode: 'ERR0400', errorMsg: 'Message ID is required.' };

/** 校验从报文明细页创建分发任务的公共参数。 */
const handleDistributeTaskCreate = ({ body }: MockBodyOption<IopDistributeCreationCreateRequest>) =>
  body?.msgId && body.userId && body.orgId
    ? { returnCode: ResCode.Success }
    : { returnCode: 'ERR0400', errorMsg: 'Message ID, user ID and organization ID are required.' };

/** 查询创建分发任务经办阶段提交的表单信息。 */
const handleDistributeTaskFormQuery = ({
  body: requestBody,
}: MockBodyOption<Pick<IopDistributeCreationCreateRequest, 'msgId'>>) => {
  if (!requestBody?.msgId) return { returnCode: 'ERR0400', errorMsg: 'Message ID is required.' };

  const body: IopDistributeCreationFormResponse = {
    targeSysId: 'CIPS',
    msgOwnerDept: 'OPS',
    msgOwnerGroup: 'PAYMENT',
  };
  return { returnCode: ResCode.Success, body };
};

/** 校验从报文明细页创建查询查复任务的请求。 */
const handleInquiryReplyCreate = ({ body }: MockBodyOption<IopInquiryReplyCreateRequest>) =>
  body?.msgId && body.userId && body.orgId && body.busData?.msgType && body.busData.content?.trim()
    ? { returnCode: ResCode.Success }
    : { returnCode: 'ERR0400', errorMsg: 'Inquiry reply task fields are required.' };

/** 查询查复经办阶段提交的表单信息。 */
const handleInquiryReplyFormQuery = ({ url }: MockRequestOption) => {
  const taskId = getLastPathSegment(url);
  if (!taskId) return { returnCode: 'ERR0400', errorMsg: 'Task ID is required.' };

  const body: IopInquiryReplyFormResponse = {
    msgType: '301',
    content: 'Please confirm the payment status and provide the processing result.',
  };
  return { returnCode: ResCode.Success, body };
};

/** 校验查询查复经办与审批请求。 */
const handleInquiryReplyAction = (option: MockBodyOption<IopInquiryReplyActionRequest>) => {
  const taskActionResponse = handleTaskAction(option);
  if (taskActionResponse.returnCode !== ResCode.Success) return taskActionResponse;

  const { body } = option;
  const isMakerNode = [IopTaskNode.MakerStage, IopTaskNode.MakerRework].includes(body.taskNode);
  if (isMakerNode && (!body.busData?.msgType || !body.busData.content.trim())) {
    return { returnCode: 'ERR0400', errorMsg: 'Message type and content are required.' };
  }

  return { returnCode: ResCode.Success };
};

/** 发报异常审批场景默认重发，工作流编号带 CANCEL 时展示取消发报。 */
const resolveExceptionOutOperation = (iopFlwiId: string): IopExceptionOutActionRequest['operation'] => {
  if (iopFlwiId.includes('CANCEL')) return 'OUT_CANCEL';
  if (iopFlwiId.includes('RETRY')) return 'OUT_RETRY';
  if (resolveTaskNode(iopFlwiId) === IopTaskNode.MakerStage) return undefined;
  return 'OUT_RETRY';
};

/** 校验发报异常仅允许经办与一级审批，并要求经办提交有效操作。 */
const handleExceptionOutAction = (option: MockBodyOption<IopExceptionOutActionRequest>) => {
  const taskActionResponse = handleTaskAction(option);
  if (taskActionResponse.returnCode !== ResCode.Success) return taskActionResponse;

  const { body } = option;
  const isMakerNode = [IopTaskNode.MakerStage, IopTaskNode.MakerRework].includes(body.taskNode);
  if (isMakerNode) {
    if (!body.next) return { returnCode: 'ERR0400', errorMsg: 'Maker must submit for approval.' };
    if (body.operation !== 'OUT_CANCEL' && body.operation !== 'OUT_RETRY') {
      return { returnCode: 'ERR0400', errorMsg: 'A valid outgoing operation is required.' };
    }
    return { returnCode: ResCode.Success };
  }
  if (body.taskNode !== IopTaskNode.Checker1Stage) {
    return { returnCode: 'ERR0400', errorMsg: 'Only first-level approval is supported.' };
  }
  return { returnCode: ResCode.Success };
};

export default [
  {
    url: '/pssst/manager/exception-out/check-in',
    method: 'post',
    response: handleExceptionOutAction,
  },
  {
    url: '/pssst/manager/api/task-info/getbyflwiid/:iopFlwiId',
    method: 'get',
    response: handleIopTaskQuery,
  },
  {
    url: '/pssst/manager/patchIncomingMsg/updateContentMsg',
    method: 'post',
    response: handleManualEntryUpdate,
  },
  {
    url: '/pssst/manager/patchIncomingMsg/confirmPatchContentToIOP',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/manager/patchIncomingMsg/rollbackPatchContent',
    method: 'post',
    response: handleManualEntryRollback,
  },
  {
    url: '/pssst/manager/patchIncomingMsg/approvePatchContentToIOP',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/manager/patchIncomingMsg/rejectPatchContentToIOP',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/clear/attributeTask/handling',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/manager/manualCrtDisTask/handling',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/manager/manualCrtDisTask/query',
    method: 'post',
    response: handleDistributeTaskFormQuery,
  },
  {
    url: '/pssst/clear/distributeTask/handling',
    method: 'post',
    response: handleTaskAction,
  },
  {
    url: '/pssst/manager/manualCrtDisTask/create',
    method: 'post',
    response: handleDistributeTaskCreate,
  },
  {
    url: '/pssst/manager/manualCipsMsg/startProcess',
    method: 'post',
    response: handleInquiryReplyCreate,
  },
  {
    url: '/pssst/manager/manualCipsMsg/approve',
    method: 'post',
    response: handleInquiryReplyAction,
  },
  {
    url: '/pssst/manager/manualCipsMsg/form/:taskId',
    method: 'get',
    response: handleInquiryReplyFormQuery,
  },
];
