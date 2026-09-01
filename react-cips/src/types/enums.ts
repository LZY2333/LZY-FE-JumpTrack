/** 报文收发方向。 */
export enum MessageDirection {
  In = 'IN',
  Out = 'OUT',
}

/** 临时报文状态，正式联调时由后端权威代码表整体替换。 */
export enum TransmissionStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

/** 临时业务状态，正式联调时由后端权威代码表整体替换。 */
export enum BusinessStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Settled = 'SETTLED',
  Rejected = 'REJECTED',
  Cancelled = 'CANCELLED',
}

/** 临时业务类型，保持四位代码以匹配当前数据表字段。 */
export enum BusinessType {
  Payment = 'PAYM',
  Query = 'QURY',
  Return = 'RTRN',
  Other = 'OTHR',
}

export const MESSAGE_DIRECTION_LABELS: Record<MessageDirection, string> = {
  [MessageDirection.In]: 'Received',
  [MessageDirection.Out]: 'Sent',
};

export const TRANSMISSION_STATUS_LABELS: Record<TransmissionStatus, string> = {
  [TransmissionStatus.Pending]: 'Pending',
  [TransmissionStatus.Processing]: 'Processing',
  [TransmissionStatus.Success]: 'Success',
  [TransmissionStatus.Failed]: 'Failed',
};

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  [BusinessStatus.Pending]: 'Pending',
  [BusinessStatus.Accepted]: 'Accepted',
  [BusinessStatus.Settled]: 'Settled',
  [BusinessStatus.Rejected]: 'Rejected',
  [BusinessStatus.Cancelled]: 'Cancelled',
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  [BusinessType.Payment]: 'Payment',
  [BusinessType.Query]: 'Query',
  [BusinessType.Return]: 'Return',
  [BusinessType.Other]: 'Other',
};

export enum Role {
  Maker = 'maker',
  Checker = 'checker',
}

/** 用户身份恢复状态。 */
export enum AuthStatus {
  Checking = 'checking',
  Authenticated = 'authenticated',
  Anonymous = 'anonymous',
}

export enum ResCode {
  Success = 'SUC0000',
}

/** 报文列表允许用户触发的服务端排序字段。 */
export type MessageSortField = 'messageTime' | 'createTime' | 'updateTime';

/** 报文列表沿用 Ant Design 的排序方向。 */
export type MessageSortOrder = 'ascend' | 'descend';
