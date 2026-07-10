import { Role, TaskStatus, TaskType, YesNo } from './enums';

export interface User {
  /** 用户ID */
  id: string;
  /** 用户姓名 */
  name: string;
  /** 用户角色列表 */
  roles: Role[];
}

export interface Attachment {
  /** 附件ID */
  fileId: string;
  /** 附件文件名 */
  fileName: string;
  /** 附件存储路径 */
  filePath: string;
  /** 附件大小，单位字节 */
  fileSize: string;
  /** 附件上传时间 */
  createTime: string;
  /** 上传该附件的柜员ID */
  createTellerId: string;
}

export interface Task {
  /** 系统生成id -Task ID */
  taskId: string;
  /** 任务名称 -Task Name */
  taskName: string;
  /** 任务类型 */
  taskType: TaskType;
  /** task状态 -Status */
  taskStatus: TaskStatus;
  /** 客户号CIF -Customer ID (CIF) */
  cusId: Customer['cusId'];
  /** maker保存的草稿差异，JSON字符串，反序列化为 TaskNewValue（相对 customer 接口变动的字段，不含附件） */
  newValue: string;

  /** 发起（Maker）柜员ID -Maker */
  inputId: string;
  /** 发起（Maker）柜员姓名 */
  inputName: string;
  /** 发起（Maker）操作时间 */
  inputTime: string;
  /** 发起（Maker）柜员所属分行编号 */
  inputBrNo: string;
  /** 发起（Maker）柜员所属分行名称 */
  inputBrName: string;

  /** 授权（Checker）柜员ID -Checker */
  authoriserId: string;
  /** 授权（Checker）柜员姓名 */
  authoriserName: string;
  /** 授权（Checker）操作时间 */
  authoriserTime: string;
  /** 授权（Checker）柜员所属分行编号 */
  authoriserBrNo: string;
  /** 授权（Checker）柜员所属分行名称 */
  authoriserBrName: string;

  /** 创建日期 -Created Date */
  createDate: string;
  /** 最后更新时间 */
  lastUpdateTime: string;
  /** 备注信息 */
  remarkMsg: string;

  /** 附件列表 -Attachments */
  attachments: Attachment[];
}

/** newValue 反序列化后的结构：只包含相对 Customer 接口变动的字段，不含附件 */
export type TaskNewValue = Partial<Customer>;

export interface Customer {
  /** 客户号CIF -CIF */
  cusId: string;
  /** 客户姓名（中文） -Customer Name */
  cusCnName: string;
  /** 客户姓名（英文） -Customer Name  */
  cusEnName: string;
  /** 客户类别，如 "CIES 2.0"，由 cusPrmAct 是否含 Hold Code D98 决定，不可修改 -Customer Type */
  cusType: string;
  /** 出生日期，格式 YYYY-MM-DD -Date of Birth */
  cusBirthDate: string;
  /** 本行参考编号 -Our Ref */
  bankCusRef: string;
  /** 政府机构参考编号 -Your Ref */
  govCusRef: string;

  /** 投资移民主账户，可能有多个 -CIES Account */
  cusPrmAct: string[];
  /** 证券账户，可能有多个 -Securities Account */
  securityAct: string[];
  /** 基金账户，可能有多个 -Fund Account */
  fundAct: string[];
  /** 债券账户，可能有多个 -Custodian Account */
  custodianAct: string[];

  /** 原则上批准日期，格式 YYYY-MM-DD -AIP Date */
  aipDate: string;
  /** 原则上批准到期日期，系统自动计算（CIES 2.0 = aipDate + 180 天），不可修改 -AIP Expiry Date */
  aipExpiryDate: string;
  /** 正式批准日期 -FA Date */
  faDate: string;
  /** 年度报告日期 -Annual Report Date */
  AnnualReportDate: string;
  /** 终止委托日期，默认空字符串（界面显示 N/A） -CIES Termination Date */
  terminationDate: string;

  /** 是否已转出 300 万投资额 -Transferred 3M */
  transferred3M: YesNo;

  /** 可支取利息，按币种分类，币种由接口动态决定 -Withdrawable Interests */
  withdrawableInterests: Record<string, number>;
  /** 已支取利息，按币种分类，币种由接口动态决定 -Transferred Interests */
  transferredInterests: Record<string, number>;
}

// 用户字段规则表

// 字段: cusId
// 展示名: CIF
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: cusCnName
// 展示名: Customer Name (CN)
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: cusEnName
// 展示名: Customer Name (EN)
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: cusType
// 展示名: Customer Type
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: cusBirthDate
// 展示名: Date of Birth
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: cusPrmAct
// 展示名: CIES Account
// 可改动: 否
// 必填: -
// ───────────
// 字段: securityAct
// 展示名:
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: fu
// 展示名: Fund Account
// 可改动:
// 必填: -
// ───────────
// 字段: custodianAct
// 展示名:
// 可改动: 否
// 必填: -
// ────────────────────────────────────────
// 字段: ba
// 展示名: Our Ref
// 可改动:
// 必填: 是
// ───────────
// 字段: govCusRef
// 展示名:
// 可改动: 是
// 必填: 是
// ────────────────────────────────────────
// 字段: ai
// 展示名: AIP Date
// 可改动:  定
// 必填: 否
// ───────────
// 字段: aipExpiryDate
// 展示名:
// 可改动: 否(系统按 aipDate+180天 自动计算)
// 必填: -
// ────────────────────────────────────────
// 字段: fa
// 展示名: FA Date
// 可改动:  定
// 必填: 否
// ───────────
// 字段: AnnualReportDate
// 展示名:
// 可改动: 条件:原始值为空时可改,非空即锁定
// 必填: 是
// ────────────────────────────────────────
// 字段: te
// 展示名: CIES Termination Date
// 可改动:
// 必填: 是
// ───────────
// 字段: transferred3M
// 展示名:
// 可改动: 是
// 必填: 是
// ────────────────────────────────────────
// 字段: wi
// 展示名: Withdrawable Interests
// 可改动:
// 必填: 否
// ───────────
// 字段: transferredInterests
// 展示名:
// 可改动: 是
// 必填: 否
