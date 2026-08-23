export const USER_EVENTS = {
  CREATE: 'user.create',
  REGISTERED: 'user.registered',
  VERIFIED: 'user.verified',
  PASSWORD_CHANGED: 'user.password_changed',
  SOFT_DELETED: 'user.deleted',
  BULK_SOFT_DELETED: 'user.bulk_soft_deleted',
  SEND_PASSWORD_RESET_LINK_BY_STAFF: 'user.send_password_reset_link',
  UPDATE: 'user.update',
  ENQUEUE_FORCE_DELETE: 'enqueue-force-delete',
  BULK_CHANGE_STATUS: 'user.change_status',
  CAPABILITY_GRANTED: 'user.capability_granted',
  CAPABILITY_REVOKED: 'user.capability_revoked',
} as const;

export type UserEvent = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
