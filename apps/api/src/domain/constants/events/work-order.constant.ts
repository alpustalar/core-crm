export const WORK_ORDER_EVENTS = {
  SENT: 'work-order.sent',
  RECEIVED: 'work-order.received',
  FITTED: 'work-order.fitted',
  OVERDUE: 'work-order.overdue',
} as const;

export type WorkOrderEvent =
  (typeof WORK_ORDER_EVENTS)[keyof typeof WORK_ORDER_EVENTS];
