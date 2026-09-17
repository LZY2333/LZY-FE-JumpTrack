/* ==================== 报文基础枚举 ==================== */

/** 报文收发方向。 */
export enum MessageDirection {
  In = 'IN',
  Out = 'OU',
}

/** 报文收发方向展示文案。 */
export const MESSAGE_DIRECTION_LABELS: Record<MessageDirection, string> = {
  [MessageDirection.In]: 'Received',
  [MessageDirection.Out]: 'Sent',
};

/** 报文收发通道。 */
export enum MessageChannel {
  /** 人民币跨境支付系统。 */
  Cips = 'CIPS',
  /** 环球银行金融电信协会通道。 */
  Swift = 'SWIFT',
  /** 集成通信服务通道。 */
  Ics = 'ICS',
  /** 实时全额结算系统。 */
  Rtgs = 'RTGS',
  /** 货币桥通道。 */
  Mbgs = 'MBGS',
  /** 快速支付系统。 */
  Fps = 'FPS',
}

/** 业务类型：BUSINESS_TYPE，数据库长度为 CHAR(5)。 */
export enum MessageBusinessType {
  Payment = 'PAY',
  Bill = 'BILL',
  Query = 'QUERY',
  Other = 'OTHER',
}

/** 业务类型展示文案：BUSINESS_TYPE。 */
export const MESSAGE_BUSINESS_TYPE_LABELS: Record<MessageBusinessType, string> = {
  [MessageBusinessType.Payment]: 'Payment',
  [MessageBusinessType.Bill]: 'Bill',
  [MessageBusinessType.Query]: 'Query',
  [MessageBusinessType.Other]: 'Other',
};

/* ==================== 报文状态枚举 ==================== */

/** 收报状态。 */
export enum MsgRecvStatus {
  Created = 'C01',
  Parsing = 'P01',
  ParseFailed = 'P02',
  Attributing = 'B01',
  ManualAttribution = 'B02',
  LcwScanning = 'L01',
  Distributing = 'D01',
  DistributionCompleted = 'D02',
}

/** 收报状态展示文案：MSG_RECV_STATUS。 */
export const MSG_RECV_STATUS_LABELS: Record<MsgRecvStatus, string> = {
  [MsgRecvStatus.Created]: 'C01 - Task Created',
  [MsgRecvStatus.Parsing]: 'P01 - Parsing',
  [MsgRecvStatus.ParseFailed]: 'P02 - Parse Failed',
  [MsgRecvStatus.Attributing]: 'B01 - Attribution',
  [MsgRecvStatus.ManualAttribution]: 'B02 - Manual Attribution',
  [MsgRecvStatus.LcwScanning]: 'L01 - LCW Scanning',
  [MsgRecvStatus.Distributing]: 'D01 - Distributing',
  [MsgRecvStatus.DistributionCompleted]: 'D02 - Distribution Completed',
};

/** 发报状态：MSG_SEND_STATUS；临时代码，待后端确认。 */
export enum MsgSendStatus {
  Pending = 'S01',
  Sending = 'S02',
  Sent = 'S03',
  Failed = 'S04',
}

/** 发报状态展示文案：MSG_SEND_STATUS。 */
export const MSG_SEND_STATUS_LABELS: Record<MsgSendStatus, string> = {
  [MsgSendStatus.Pending]: 'S01 - Pending',
  [MsgSendStatus.Sending]: 'S02 - Sending',
  [MsgSendStatus.Sent]: 'S03 - Sent',
  [MsgSendStatus.Failed]: 'S04 - Failed',
};

/* ==================== LCW 状态枚举 ==================== */

/** LCW 初次判定状态。 */
export enum LcwInitialStatus {
  /** 初始化。 */
  Initialized = 'O',
  /** 处理中。 */
  Processing = 'I',
  /** 反洗钱扫描超时。 */
  Timeout = 'W',
  /** 反洗钱扫描服务不可用。 */
  Unavailable = 'U',
  /** 疑似命中。 */
  SuspectedHit = 'H',
  /** 通过。 */
  Passed = 'P',
  /** 数据不存在。 */
  DataMissing = 'G',
  /** 调用异常。 */
  InvocationFailed = 'F',
  /** 手工确认重发。 */
  ManualRetry = 'M',
}

/** LCW 初次判定状态展示文案。 */
export const LCW_INITIAL_STATUS_LABELS: Record<LcwInitialStatus, string> = {
  [LcwInitialStatus.Initialized]: 'O - Initialized',
  [LcwInitialStatus.Processing]: 'I - Processing',
  [LcwInitialStatus.Timeout]: 'W - LCW Scan Timeout',
  [LcwInitialStatus.Unavailable]: 'U - LCW Service Unavailable',
  [LcwInitialStatus.SuspectedHit]: 'H - Suspected Hit',
  [LcwInitialStatus.Passed]: 'P - Passed',
  [LcwInitialStatus.DataMissing]: 'G - Data Missing',
  [LcwInitialStatus.InvocationFailed]: 'F - Invocation Failed',
  [LcwInitialStatus.ManualRetry]: 'M - Manual Retry Submitted',
};

/* ==================== 权限与响应枚举 ==================== */

/** 用户角色。 */
export enum Role {
  Maker = 'maker',
  Checker = 'checker',
}

/** 接口响应编码。 */
export enum ResCode {
  Success = 'SUC0000',
}

/* ==================== 排序类型 ==================== */

/** 表格统一沿用 Ant Design 的排序方向。 */
export enum SortOrder {
  /** 升序。 */
  Ascend = 'ascend',
  /** 降序。 */
  Descend = 'descend',
}

/** 接口查询统一使用的排序方向。 */
export enum QuerySortOrder {
  /** 升序。 */
  Asc = 'asc',
  /** 降序。 */
  Desc = 'desc',
}

/* ==================== IOP任务 ==================== */

/** IOP任务中文名，处理内容(我们系统)，处理内容(IOP页) */
/** IOP任务类型：TASK_FLOW_NO，同时也对应IOP流程ID(TASK_FLOW_NO) */
export enum IopTaskType {
  /** 手工补录，自动创建task，(IOP页)Maker修改报文原文 + Checker审批 */
  manualEntry = 'ST10',
  /** 手工归属(场景：清分未命中)，自动创建task，(IOP页)Maker修改dept group + Checker审批*/
  manualAttribute = 'ST11',
  /** 创建分发任务，手动创建task(detail页修改dept group)，(IOP页)Checker审批 */
  distributeCreation = 'ST12',
  /** 分发异常(场景：下游接口报错)，自动创建task，(IOP页)审批 */
  distributeException = 'ST13',
  /** 创建查询类报文(场景：基于支付类报文发起)，手动创建task(detail页填写content字段)，(IOP页)Checker二级审批 */
  inquiryPayment = 'ST14',
  /** 回复查询类报文，手动创建task(detail页填写content字段)，(IOP页)Checker二级审批 */
  inquiryReply = 'ST15',
  /** 发报异常，自动创建task，(IOP页)Maker选OUT_RETRY/OUT_CANCEL + Checker审批 */
  exceptionOut = 'ST16',
}

/** IOP 任务类型展示名：TASK_FLOW_NO */
export const IOP_TASK_TYPE_LABELS: Record<IopTaskType, string> = {
  [IopTaskType.manualEntry]: 'PSSST Manual Entry',
  [IopTaskType.manualAttribute]: 'PSSST Manual Attribute',
  [IopTaskType.distributeCreation]: 'PSSST Distribute Creation',
  [IopTaskType.distributeException]: 'PSSST Distribute Exception',
  [IopTaskType.inquiryPayment]: 'PSSST Inquiry Payment',
  [IopTaskType.inquiryReply]: 'PSSST Inquiry Reply',
  [IopTaskType.exceptionOut]: 'PSSST Exception Out',
};

/** IOP 任务当前环节：TASK_NODE。 */
export enum IopTaskNode {
  /** 经办中。 */
  MakerStage = '1',
  /** 待一级审批。 */
  Checker1Stage = '2',
  /** 待二级审批。 */
  Checker2Stage = '3',
  /** 待经办更正。 */
  MakerRework = '4',
  /** 审批通过。 */
  Approved = '5',
  /** 取消。 */
  Cancelled = '6',
}

/** IOP 任务当前环节展示文案：TASK_NODE。 */
export const IOP_TASK_NODE_LABELS: Record<IopTaskNode, string> = {
  [IopTaskNode.MakerStage]: 'Maker Stage',
  [IopTaskNode.Checker1Stage]: 'Checker 1 Stage',
  [IopTaskNode.Checker2Stage]: 'Checker 2 Stage',
  [IopTaskNode.MakerRework]: 'Maker Rework',
  [IopTaskNode.Approved]: 'Approved',
  [IopTaskNode.Cancelled]: 'Cancelled',
};

/** IOP 审批结果。 */
export enum ApprovalYesNo {
  /** 审批通过。 */
  Yes = 'Y',
  /** 审批拒绝。 */
  No = 'N',
}
