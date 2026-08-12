import type { Task, User } from '@/types';
import { Role, TaskStatus } from '@/types/enums';

const EDITABLE_STATUSES = [TaskStatus.Pending, TaskStatus.Returned];

export const getTaskAccess = (task: Task, user?: User) => {
  if (!user) {
    return {
      userId: null,
      canEdit: false as const,
      canReview: false as const,
      editDisabledReason: 'Maker only',
      reviewDisabledReason: 'Checker only',
    };
  }

  const isMaker = user.roles.includes(Role.Maker);
  const isChecker = user.roles.includes(Role.Checker);
  const isSelfReview = !!task.makerId && task.makerId === user.id;
  let reviewDisabledReason = '';
  if (!isChecker) {
    reviewDisabledReason = 'Checker only';
  } else if (isSelfReview) {
    reviewDisabledReason = 'You cannot review your own submission';
  }

  return {
    userId: user.id,
    canEdit: EDITABLE_STATUSES.includes(task.taskStatus) && isMaker,
    canReview: task.taskStatus === TaskStatus.Submitted && isChecker && !isSelfReview,
    editDisabledReason: !isMaker ? 'Maker only' : '',
    reviewDisabledReason,
  };
};
