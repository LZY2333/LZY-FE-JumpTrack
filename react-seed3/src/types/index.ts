import { Role, TaskStatus, YesNo } from './enums';

export interface User {
  id: string;
  name: string;
  roles: Role[];
}

export interface Attachment {
  name: string;
  uid: string;
}

export interface Task {
  id: string;
  refNo: string;
  customerName: string;
  createdAt: string;
  status: TaskStatus;
  daysUntilDue: number | null;
  /** 关联的客户 id，进入表单时据此查询客户详情 */
  customerId: string;
  /** 任务附件列表 */
  attachments: Attachment[];
  /** 提交该任务的 Maker 用户 id，Checker 审批时需校验与当前用户不同 */
  makerId: string;
}

export interface Customer {
  id: string;
  /** 客户类别，如 "CIES 2.0"，由 Hold Code D98 决定，不可修改 */
  customerType: string;
  /** 客户姓名，从 T24 系统获取，不可修改 */
  customerName: string;
  /** 出生日期，格式 YYYY-MM-DD */
  dateOfBirth: string;
  /** T24 客户号，脱敏展示 */
  cif: string;
  savingsAccount: string;
  securitiesAccount: string;
  fundAccount: string;
  /** 债券托管账户号 */
  custodianAccount: string;
  /** 本行参考编号（Our Ref），首次由 Maker 录入，后续系统回显 */
  ourRef: string;
  /** 政府机构参考编号（Your Ref） */
  yourRef: string;
  /** 原则上批准日期，格式 YYYY-MM-DD */
  aipDate: string;
  /** 原则上批准到期日期，系统自动计算（CIES 2.0 = aipDate + 180 天），不可修改 */
  aipExpiryDate: string;
  /** 正式批准日期 */
  faDate: string;
  /** 终止委托日期，默认空字符串（界面显示 N/A） */
  ciesTerminationDate: string;
  /** 是否已转出 300 万投资额 */
  transferred3M: YesNo;
  /** 可支取利息，按币种分类，币种由接口动态决定 */
  withdrawableInterests: Record<string, number>;
  /** 已支取利息，按币种分类，币种由接口动态决定 */
  transferredInterests: Record<string, number>;
}
