/** 任务状态，对应数据库字段 TASK_STATUS。 */
export enum TaskStatus {
  /** 待处理 */
  Pending = 'S01',
  /** 已提交待复核 */
  Submitted = 'S02',
  /** 已批准 */
  Approved = 'S03',
  /** 已退回待 Maker 修改 */
  Returned = 'S04',
  /** 已取消 */
  Cancelled = 'S05',
}

/** 申报交易类型，对应数据库字段 TRAN_TYPE。 */
export enum TranType {
  /** NCIES Daily Report */
  DailyReport = 'T01',
  /** NCIES Annual Report */
  AnnualReport = 'T02',
  /** NCIES Ad-hoc Report */
  AdHocReport = 'T03',
  /** NCIES AIP Report */
  AipReport = 'T04',
  /** NCIES Information Amendment */
  InformationAmendment = 'T05',
}

/** CIES 客户标记，对应数据库字段 CIES_FLAG。 */
export enum CiesFlag {
  Cies10 = 'CIES1.0',
  Cies20 = 'CIES2.0',
}

/** 投资账户类型，对应数据库字段 INVEST_TYPE。 */
export enum InvestType {
  /** 证券账户 */
  Securities = 'SECURITIES',
  /** 基金账户 */
  Funds = 'FUNDS',
  /** 债券账户 */
  Custody = 'CUSTODY',
}

export enum Role {
  Maker = 'CIESMaker',
  Checker = 'CIESChecker',
}

export enum YesNo {
  Yes = 'Y',
  No = 'N',
}

export enum ResCode {
  Success = 'SUC0000',
}

export type TaskSortField = 'taskId' | 'createTime' | 'transactionTime' | 'updateTime';

export type TaskSortOrder = 'asc' | 'desc';
