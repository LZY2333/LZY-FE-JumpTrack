import type { Role } from './enums';

export type { LcwRecord } from './lcw';
export type { MessageRecord, MessageAuditTrailRecord, MessageDetail, MessageEntityRecord } from './message';

export interface UserIdentity {
  /** 用户 ID */
  userId: string;
  /** 机构 ID */
  orgId: string;
  /** 用户名 */
  userName: string;
}

export interface User extends UserIdentity {
  /** 用户角色列表 */
  roles: Role[];
}

export type NullableText = string | null;
