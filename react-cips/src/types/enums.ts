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

/** BUSINESS_TYPE：业务信息表分类；正式代码值待后端代码表确认。 */
export enum MessageBusinessType {
  Query = 'QURY',
  Bill = 'BILL',
  Payment = 'PAYM',
}

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
export type MessageSortField = 'msgRecvDate' | 'msgSendDate' | 'createTime' | 'updateTime';

/** 报文列表沿用 Ant Design 的排序方向。 */
export type MessageSortOrder = 'ascend' | 'descend';
