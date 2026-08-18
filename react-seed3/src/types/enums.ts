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

export enum Role {
  Maker = 'maker',
  Checker = 'checker',
}

export enum ResCode {
  Success = 'SUC0000',
}

export type TaskSortField = 'taskId' | 'taskName' | 'createTime' | 'updateTime';

export type TaskSortOrder = 'asc' | 'desc';
