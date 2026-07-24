export const ACTIVITY_EVENTS = {
  CREATED: 'activity.created',
  DELETED: 'activity.deleted',
  UPDATED: 'activity.updated',
} as const;

export type ActivityEvent =
  (typeof ACTIVITY_EVENTS)[keyof typeof ACTIVITY_EVENTS];
