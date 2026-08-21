import { Role, TaskStatus } from './enums';

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

/** 任务列表、详情与状态流转共用的基础模型。 */
export interface Task {
  /** 任务流水号 */
  taskId: string;
  /** 任务名称 */
  taskName: string;
  /** 任务描述 */
  description: string;
  /** 任务状态 */
  taskStatus: TaskStatus;
  /** 操作人，尚未处理时为空字符串 */
  makerId: string;
  /** 复核人，尚未复核时为空字符串 */
  checkerId: string;
  /** 创建日期，格式 YYYY-MM-DD */
  createTime: string;
  /** 最后更新日期，格式 YYYY-MM-DD */
  updateTime: string;
  /** 退回原因，无备注时为空字符串 */
  taskRemark: string;
}
