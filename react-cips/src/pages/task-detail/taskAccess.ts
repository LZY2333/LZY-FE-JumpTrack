import type { Task, User } from '@/types';
import { Role, TaskStatus } from '@/types/enums';

const EDITABLE_STATUSES = [TaskStatus.Pending, TaskStatus.Returned];

export const getTaskAccess = (task?: Task | null, user?: User) => {
  if (!task) {
    return {
      userId: user?.userId ?? null,
      canEdit: false as const,
      canReview: false as const,
      editDisabledReason: 'Task data is unavailable',
      reviewDisabledReason: 'Task data is unavailable',
    };
  }

  const isMaker = user!.roles.includes(Role.Maker);
  const isChecker = user!.roles.includes(Role.Checker);
  const isSelfReview = !!task.makerId && task.makerId === user!.userId;
  let reviewDisabledReason = '';
  if (!isChecker) {
    reviewDisabledReason = 'Checker only';
  } else if (isSelfReview) {
    reviewDisabledReason = 'You cannot review your own submission';
  }

  return {
    userId: user!.userId,
    canEdit: EDITABLE_STATUSES.includes(task.taskStatus) && isMaker,
    canReview: task.taskStatus === TaskStatus.Submitted && isChecker && !isSelfReview,
    editDisabledReason: !isMaker ? 'Maker only' : '',
    reviewDisabledReason,
  };
};
