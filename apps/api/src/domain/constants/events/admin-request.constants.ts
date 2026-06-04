export const ADMIN_REQUEST_EVENTS = {
  CREATED: 'admin-request.created',
  REVIEWED: 'admin-request.reviewed',
} as const;

export type AdminRequestEvent =
  (typeof ADMIN_REQUEST_EVENTS)[keyof typeof ADMIN_REQUEST_EVENTS];
