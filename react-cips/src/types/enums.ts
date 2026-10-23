/* ==================== 基础配置字典 ==================== */

/** 基础配置字典类型 */
export enum DictionaryOptionsEnum {
  /** 币种 */
  Currency = 'optsCurrency',
  /** 报文类型 */
  MsgType = 'optsMsgType',
  /** 系统编号 */
  SystemId = 'optsSystemId',
  /** 部门 */
  Dept = 'optsDept',
  /** 组 */
  Group = 'optsGroup',

  /** 模板发报类型 */
  MsgTypeTempSend = 'optsMsgTypeTempSend',
  /** 模板撤销申请的原报文类型 */
  TempSendCancellationMsgType = 'optsTempSendCancellationMsgType',
  /** 模板状态查询的原报文类型 */
  TempSendStatusQueryMsgType = 'optsTempSendStatusQueryMsgType',
}

/** 字典下拉选项 */
export interface DictionaryOption {
  /** 显示文本 */
  label: string;
  /** 提交的配置编码 */
  value: string;
}

/** 按字典类型保存的下拉选项，缺省表示尚未加载 */
export type DictionaryOptions = Partial<Record<DictionaryOptionsEnum, DictionaryOption[]>>;

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
  DistributionManual = 'B02',
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
  [MsgRecvStatus.DistributionManual]: 'B02 - Distribution Manual',
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

/** 是否标志 */
export enum YesNo {
  Yes = 'Y',
  No = 'N',
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

/* ==================== IOP 任务 ==================== */

/** 查询查复报文类型。 */
export enum IopInquiryReplyMsgType {
  Type301 = 'cips.301.001.02',
  Type302 = 'cips.302.001.02',
  Type309 = 'cips.309.001.01',
}

/** IOP 任务类型：TASK_FLOW_NO，同时对应 IOP 流程编号。 */
export enum IopTaskType {
  /** 手工补录：系统自动创建任务，Maker 修改报文原文，Checker 审批。 */
  manualEntry = 'ST10',
  /** 手工分发：清分未命中时自动创建任务，Maker 修改归属后完成 */
  distributionManual = 'ST11',
  /** 创建分发任务：从报文明细页创建并填写归属信息，IOP 页面完成经办和审批。 */
  distributeCreation = 'ST12',
  /** 分发异常：下游接口报错时自动创建任务，Maker 重新分发后完成。 */
  distributeException = 'ST13',
  /** 查询查复：从报文明细页创建任务，IOP 页面完成经办和二级审批。 */
  inquiryReply = 'ST15',
  /** 发报异常：系统自动创建任务，Maker 选择重试或取消，Checker 审批。 */
  exceptionOut = 'ST16',
}

/** IOP 任务类型展示名：TASK_FLOW_NO */
export const IOP_TASK_TYPE_LABELS: Record<IopTaskType, string> = {
  [IopTaskType.manualEntry]: 'PSSST Manual Entry',
  [IopTaskType.distributionManual]: 'PSSST Distribution Manual',
  [IopTaskType.distributeCreation]: 'PSSST Distribute Creation',
  [IopTaskType.distributeException]: 'PSSST Distribute Exception',
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

/* ==================== 参与行管理 ==================== */

/** 参与行及直间参关系变更类型 */
export enum PartyChangeTypeEnum {
  /** 新增 */
  Add = 'ADDD',
  /** 修改 */
  Modify = 'MODI',
  /** 删除 */
  Delete = 'DELE',
}

/** 参与者资格标识 */
export enum PartyBankCategoryEnum {
  /** 直参 */
  Direct = 'DRPT',
  /** 间参 */
  Indirect = 'IDPT',
}

/** 境内外标识 */
export enum PartyDomesticFlagEnum {
  /** 境内参与者 */
  Domestic = 'DMPT',
  /** 境外参与者 */
  Overseas = 'OSPT',
}

/** 办理业务状态 */
export enum PartyBusinessStatusEnum {
  /** 正常 */
  Enabled = 'ENBL',
  /** 暂停 */
  Disabled = 'DSBL',
}

/** 登录状态 */
export enum PartyLoginStatusEnum {
  /** 登录 */
  LoggedIn = 'LOGN',
  /** 退出 */
  LoggedOut = 'LOGF',
}

/* ==================== 日夜场状态枚举 ==================== */

/** 日夜场当前系统状态 */
export enum DayNightStatusEnum {
  /** 日间营业准备 */
  DaytimePreparation = 'CLSD',
  /** 日间处理 */
  DaytimeProcessing = 'ACTV',
  /** 日间业务截止 */
  DaytimeCutoff = 'SUSP',
  /** 场终处理 */
  SessionClosing = 'CLSG',
  /** 夜间处理 */
  NighttimeProcessing = 'NTAC',
  /** 夜间业务截止 */
  NighttimeCutoff = 'NTSP',
  /** 日终 */
  DayEnd = 'NTCS',
}

/** 日夜场状态展示文案 */
export const DAY_NIGHT_STATUS_LABELS: Record<DayNightStatusEnum, string> = {
  [DayNightStatusEnum.DaytimePreparation]: '日间营业准备',
  [DayNightStatusEnum.DaytimeProcessing]: '日间处理',
  [DayNightStatusEnum.DaytimeCutoff]: '日间业务截止',
  [DayNightStatusEnum.SessionClosing]: '场终处理',
  [DayNightStatusEnum.NighttimeProcessing]: '夜间处理',
  [DayNightStatusEnum.NighttimeCutoff]: '夜间业务截止',
  [DayNightStatusEnum.DayEnd]: '日终',
};
