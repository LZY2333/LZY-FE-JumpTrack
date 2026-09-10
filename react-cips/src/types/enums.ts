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
