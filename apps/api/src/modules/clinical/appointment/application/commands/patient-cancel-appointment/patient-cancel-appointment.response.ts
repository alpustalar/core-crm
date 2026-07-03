export const CancelAppointmentStatus = {
  CANCELLED: 'CANCELLED',
  CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED',
} as const;

export type CancelAppointmentStatusType =
  (typeof CancelAppointmentStatus)[keyof typeof CancelAppointmentStatus];

export type PatientCancelAppointmentResponse = {
  status: CancelAppointmentStatusType;
};
