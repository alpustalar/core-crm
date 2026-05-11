export const THROTTLE_EVENTS = {
  RATE_LIMIT_EXCEEDED: 'throttle.rate_limit_exceeded',
} as const;

export type ThrottleEvent =
  (typeof THROTTLE_EVENTS)[keyof typeof THROTTLE_EVENTS];
