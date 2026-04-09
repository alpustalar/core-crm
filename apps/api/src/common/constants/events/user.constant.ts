export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  VERIFIED: 'user.verified',
  PASSWORD_CHANGED: 'user.password_changed',
  SOFT_DELETED: 'user.deleted',
} as const;

export type UserEvent = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
