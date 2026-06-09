export const SECURITY_EVENTS = {
  ACCESS_DENIED: 'security.access_denied',
} as const;

export type SecurityEvent = (typeof SECURITY_EVENTS)[keyof typeof SECURITY_EVENTS];
