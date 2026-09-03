/** 报文收发方向。 */
export enum MessageDirection {
  In = 'IN',
  Out = 'OU',
}

/** 收报状态。 */
export enum MsgRecvStatus {
  Created = 'C01',
  Parsing = 'P01',
  ParseFailed = 'P02',
  Attributing = 'B01',
  ManualAttribution = 'B02',
  AmlScanning = 'L01',
  Distributing = 'D01',
  DistributionCompleted = 'D02',
}

/** 发报状态：MSG_SEND_STATUS；临时代码，待后端确认。 */
export enum MsgSendStatus {
  Pending = 'S01',
  Sending = 'S02',
  Sent = 'S03',
  Failed = 'S04',
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

/** 发报状态展示文案：MSG_SEND_STATUS。 */
export const MSG_SEND_STATUS_LABELS: Record<MsgSendStatus, string> = {
  [MsgSendStatus.Pending]: 'S01 - Pending',
  [MsgSendStatus.Sending]: 'S02 - Sending',
  [MsgSendStatus.Sent]: 'S03 - Sent',
  [MsgSendStatus.Failed]: 'S04 - Failed',
};

export const MESSAGE_DIRECTION_LABELS: Record<MessageDirection, string> = {
  [MessageDirection.In]: 'Received',
  [MessageDirection.Out]: 'Sent',
};

export const MSG_RECV_STATUS_LABELS: Record<MsgRecvStatus, string> = {
  [MsgRecvStatus.Created]: 'C01 - Task Created',
  [MsgRecvStatus.Parsing]: 'P01 - Parsing',
  [MsgRecvStatus.ParseFailed]: 'P02 - Parse Failed',
  [MsgRecvStatus.Attributing]: 'B01 - Attribution',
  [MsgRecvStatus.ManualAttribution]: 'B02 - Manual Attribution',
  [MsgRecvStatus.AmlScanning]: 'L01 - AML Scanning',
  [MsgRecvStatus.Distributing]: 'D01 - Distributing',
  [MsgRecvStatus.DistributionCompleted]: 'D02 - Distribution Completed',
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
export type MessageSortField = 'msgDate' | 'createTime' | 'updateTime';

/** 报文列表沿用 Ant Design 的排序方向。 */
export type MessageSortOrder = 'ascend' | 'descend';
