export const CLINIC_EVENTS = {
  CREATED: 'clinic.created',
  UPDATED: 'clinic.updated',
  MERGED: 'clinic.merged',
  SOFT_DELETED: 'clinic.deleted',
  ACTIVATED: 'clinic.activated',
  DEACTIVATED: 'clinic.deactivated',
} as const;

export const ORGANIZATION_EVENTS = {
  CREATED: 'organization.created',
  UPDATED: 'organization.updated',
  SOFT_DELETED: 'organization.deleted',
  ACTIVATED: 'organization.activated',
  DEACTIVATED: 'organization.deactivated',
};

export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  VERIFIED: 'user.verified',
  PASSWORD_CHANGED: 'user.password_changed',
  SOFT_DELETED: 'user.deleted',
} as const;

export const APPOINTMENT_EVENTS = {
  BOOKED: 'appointment.booked',
  CONFIRMED: 'appointment.confirmed',
  CANCELLED: 'appointment.cancelled',
  COMPLETED: 'appointment.completed',
  NO_SHOW: 'appointment.no_show',
} as const;

export const PATIENT_EVENTS = {
  CREATED: 'patient.created',
  UPDATED: 'patient.updated',
  ARCHIVED: 'patient.archived',
} as const;

export const DOCTOR_EVENTS = {
  CREATED: 'doctor.created',
  UPDATED: 'doctor.updated',
  DEACTIVATED: 'doctor.deactivated',
} as const;

export const TREATMENT_EVENTS = {
  CREATED: 'treatment.created',
  UPDATED: 'treatment.updated',
  SOFT_DELETED: 'treatment.deleted',
} as const;

export type ClinicEvent = (typeof CLINIC_EVENTS)[keyof typeof CLINIC_EVENTS];
export type UserEvent = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
export type AppointmentEvent =
  (typeof APPOINTMENT_EVENTS)[keyof typeof APPOINTMENT_EVENTS];
