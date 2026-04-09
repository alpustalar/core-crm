export const DOCTOR_EVENTS = {
  CREATED: 'doctor.created',
  UPDATED: 'doctor.updated',
  DEACTIVATED: 'doctor.deactivated',
} as const;

export type DoctorEvent = (typeof DOCTOR_EVENTS)[keyof typeof DOCTOR_EVENTS];
