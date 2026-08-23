export const OPS_EVENTS = {
  /** Yutulmuş kritik hata — operatör bildirimi gerektirir. */
  CRITICAL_FAILURE: 'ops.critical-failure',
} as const;

export type OpsEvent = (typeof OPS_EVENTS)[keyof typeof OPS_EVENTS];
