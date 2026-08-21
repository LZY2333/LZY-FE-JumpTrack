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

/** 用户身份恢复状态。 */
export enum AuthStatus {
  Checking = 'checking',
  Authenticated = 'authenticated',
  Anonymous = 'anonymous',
}

export enum ResCode {
  Success = 'SUC0000',
}

/** 任务列表支持排序的字段。 */
export type TaskSortField = 'taskId' | 'taskName' | 'createTime' | 'updateTime';

/** 任务列表沿用 Ant Design 的排序方向。 */
export type TaskSortOrder = 'ascend' | 'descend';
