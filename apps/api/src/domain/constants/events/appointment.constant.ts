export const APPOINTMENT_EVENTS = {
  BOOKED: 'appointment.booked',
  CONFIRMED: 'appointment.confirmed',
  CANCELLED: 'appointment.cancelled',
  COMPLETED: 'appointment.completed',
  NO_SHOW: 'appointment.no_show',
} as const;

export type AppointmentEvent =
  (typeof APPOINTMENT_EVENTS)[keyof typeof APPOINTMENT_EVENTS];
