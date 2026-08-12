export const ACTIVITY_EVENTS = {
  CREATED: 'activity.created',
  DELETED: 'activity.deleted',
  UPDATED: 'activity.updated',
  LIST_BY_LEAD: 'activity.list-by-lead',
  LIST_MY_TASKS: 'activity.list-my-tasks',
} as const;

export type ActivityEvent =
  (typeof ACTIVITY_EVENTS)[keyof typeof ACTIVITY_EVENTS];
