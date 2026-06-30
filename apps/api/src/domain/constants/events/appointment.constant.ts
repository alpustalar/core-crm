export const APPOINTMENT_EVENTS = {
  BOOKED: 'appointment.booked',
  CONFIRMED: 'appointment.confirmed',
  CANCELLED: 'appointment.cancelled',
  COMPLETED: 'appointment.completed',
  NO_SHOW: 'appointment.no_show',
  LIST_CLINIC: 'appointment.list-clinic',
  LIST_ORGANIZATION: 'appointment.list-organization',
  PROVIDER_CALENDAR: 'appointment.provider-calendar',
  PROVIDER_AVAILABILITY: 'appointment.provider-availability',
  DETAIL: 'appointment.detail',
  ACTION_REQUIRED: 'appointment.action-required',
  SCHEDULE: 'appointment.schedule',
  SCHEDULED: 'appointment.scheduled',
  CANCELLATION_REQUESTED: 'appointment.cancellation-requested',
  RESCHEDULE: 'appointment.reschedule',
} as const;

export type AppointmentEvent =
  (typeof APPOINTMENT_EVENTS)[keyof typeof APPOINTMENT_EVENTS];
