import { CiesFlag, InvestType, Role, TaskStatus, TranType, YesNo } from './enums';

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
  /** 附件大小，单位字节 */
  fileSize: string;
  /** 附件上传时间 */
  createTime: string;
  /** 创建用户，TellerID 或 SYSTEM */
  createUser: string;
}

export interface InvestmentAccount {
  /** 投资账号 */
  investAct: string;
  /** 投资类型 */
  investType: InvestType;
}

/**
 * 任务列表 DTO，由任务信息表、申报交易表与客户信息联表查询。
 * 仅保留当前列表展示与任务流控制需要的字段。
 */
export interface Task {
  /** 任务流水号 -Task ID */
  taskId: string;
  /** 报送交易类型，界面映射为任务名称 -Task Name */
  tranType: TranType;
  /** 任务状态 -Status */
  taskStatus: TaskStatus;
  /** 客户号CIF -Customer ID (CIF) */
  cusId: Customer['cusId'];
  /** 客户英文名 -Customer Name */
  cusEnName: Customer['cusEnName'];
  /** 客户中文名 -Customer Name */
  cusCnName: Customer['cusCnName'];
  /** 操作任务的柜员ID，尚未处理时为空字符串 -Maker */
  makerId: string;
  /** 授权任务的柜员ID，尚未复核时为空字符串 -Checker */
  checkerId: string;
  /** 任务日期，格式 YYYY-MM-DD -Task Date */
  createTime: string;
  /** 申报交易日期，格式 YYYY-MM-DD -Transaction Date */
  transactionTime: string;
  /** 任务最后更新日期，格式 YYYY-MM-DD -Update Date */
  updateTime: string;
  /** 任务备注（退回原因），无备注时为空字符串 */
  taskRemark: string;
}

export interface Customer {
  /** 客户号CIF -CIF */
  cusId: string;
  /** 投资移民主账户列表 -CIES Account */
  cusPrmAct: string[];
  /** CIES 客户标记，不可修改 -Customer Type */
  ciesFlag: CiesFlag;
  /** 客户姓名（英文） -Customer Name  */
  cusEnName: string;
  /** 客户姓名（中文） -Customer Name */
  cusCnName: string;
  /** 出生日期，格式 YYYY-MM-DD -Date of Birth */
  cusBirthDate: string;
  /** 政府机构参考编号 -Your Ref */
  govCusRef: string;
  /** 本行参考编号 -Our Ref */
  bankCusRef: string;

  /** 投资账户列表，界面按 investType 分组展示 */
  investmentAccounts: InvestmentAccount[];

  /** 净资产审核通过日期，格式 YYYY-MM-DD -AIP Date */
  principleAppDate: string;
  /** 完成指定投资额的到期日期，系统自动计算，不可修改 -AIP Expiry Date */
  principleExpDate: string;
  /** 正式批准日期 -FA Date */
  formalAppDate: string;
  /** 年度报告日期 -Annual Report Date */
  annualReportDate: string;
  /** 终止委托日期， -CIES Termination Date */
  terminationDate: string;

  /** 是否已转出 300 万投资额 -Transferred 3M */
  capitalInvestFlag: YesNo;

  /** 可支取利息，按币种分类，币种由接口动态决定 -Withdrawable Interests */
  withdrawnIntr: Record<string, number>;
  /** 已转出利息，按币种分类，币种由接口动态决定 -Transferred Interests */
  transferIntr: Record<string, number>;
}

/**
 * Customer 表单字段规则。DTO 字段名与后端保持一致，展示名沿用现有界面文案。
 *
 * | 字段 | 展示名 | 可改动 | 必填 |
 * | --- | --- | --- | --- |
 * | cusId | CIF | 否 | — |
 * | ciesFlag | Customer Type | 否 | — |
 * | cusCnName | Customer Name (CN) | 否 | — |
 * | cusEnName | Customer Name (EN) | 否 | — |
 * | cusBirthDate | Date of Birth | 否 | — |
 * | cusPrmAct | CIES Account | 否 | — |
 * | investmentAccounts | Securities / Fund / Custodian Account | 否 | — |
 * | bankCusRef | Our Ref | 是 | 是 |
 * | govCusRef | Your Ref | 是 | 是 |
 * | principleAppDate | AIP Date | 原始值为空时可改 | 否 |
 * | principleExpDate | AIP Expiry Date | 否，系统自动计算 | — |
 * | formalAppDate | FA Date | 原始值为空时可改 | 否 |
 * | annualReportDate | Annual Report Date | 原始值为空时可改 | 是 |
 * | terminationDate | CIES Termination Date | 是 | 否 |
 * | capitalInvestFlag | Transferred 3M | 是 | 是 |
 * | withdrawnIntr | Withdrawable Interests | 是 | 否 |
 * | transferIntr | Transferred Interests | 是 | 否 |
 */
