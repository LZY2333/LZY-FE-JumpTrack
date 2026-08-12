import { describe, expect, it } from 'vitest';
import type { Task, User } from '@/types';
import { Role, TaskStatus, TranType } from '@/types/enums';
import { getTaskAccess } from '@/pages/task-detail/taskAccess';

const createTask = (taskStatus: TaskStatus, makerId = ''): Task => ({
  taskId: 'T001',
  tranType: TranType.DailyReport,
  taskStatus,
  cusId: 'C001',
  cusEnName: 'Test',
  cusCnName: '测试',
  makerId,
  checkerId: '',
  createTime: '2026-08-07',
  transactionTime: '2026-08-07',
  updateTime: '2026-08-07',
  taskRemark: '',
});

const createUser = (id: string, roles: Role[]): User => ({ id, roles, name: id });

describe('getTaskAccess', () => {
  it('denies all actions when the user is missing', () => {
    const access = getTaskAccess(createTask(TaskStatus.Submitted, 'maker-1'));

    expect(access.userId).toBeNull();
    expect(access.canEdit).toBe(false);
    expect(access.canReview).toBe(false);
  });

  it('allows a Maker to edit an unassigned editable task', () => {
    const access = getTaskAccess(createTask(TaskStatus.Pending), createUser('maker-1', [Role.Maker]));

    expect(access.canEdit).toBe(true);
  });

  it('allows any Maker to edit an assigned task', () => {
    const access = getTaskAccess(createTask(TaskStatus.Returned, 'maker-1'), createUser('maker-2', [Role.Maker]));

    expect(access.canEdit).toBe(true);
    expect(access.editDisabledReason).toBe('');
  });

  it('allows a Checker to review only a submitted task made by someone else', () => {
    const checker = createUser('checker-1', [Role.Checker]);

    expect(getTaskAccess(createTask(TaskStatus.Submitted, 'maker-1'), checker).canReview).toBe(true);
    expect(getTaskAccess(createTask(TaskStatus.Pending, 'maker-1'), checker).canReview).toBe(false);
    expect(getTaskAccess(createTask(TaskStatus.Submitted, 'checker-1'), checker).canReview).toBe(false);
  });
});
