export const ATTENDANCE_EVENTS = {
  CHECK_IN: 'attendance.check_in',
  CHECK_OUT: 'attendance.check_out',
  RECORD: 'attendance.record',
  LIST: 'attendance.list',
  SUMMARY: 'attendance.summary',
} as const;

export type AttendanceEvent =
  (typeof ATTENDANCE_EVENTS)[keyof typeof ATTENDANCE_EVENTS];
