export const USER_EVENTS = {
  CREATE: 'user.create',
  REGISTERED: 'user.registered',
  VERIFIED: 'user.verified',
  PASSWORD_CHANGED: 'user.password_changed',
  SOFT_DELETED: 'user.deleted',
  SEND_PASSWORD_RESET_LINK_BY_STAFF: 'user.send_password_reset_link',
  UPDATE_BY_STAFF: 'user.update_by_staff',
  ENQUEUE_FORCE_DELETE: 'enqueue-force-delete',
} as const;

export type UserEvent = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
