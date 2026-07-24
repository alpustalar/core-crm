export const LEAVE_EVENTS = {
  CANCELLED: 'leave.cancelled',
  APPROVED: 'leave.approved',
  REJECTED: 'leave.rejected',
  REQUESTED: 'leave.requested',
  PENDING: 'leave.pending',
} as const;

export type LeaveEvent = (typeof LEAVE_EVENTS)[keyof typeof LEAVE_EVENTS];
