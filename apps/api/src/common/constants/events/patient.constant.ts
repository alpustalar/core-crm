export const PATIENT_EVENTS = {
  CREATED: 'patient.created',
  UPDATED: 'patient.updated',
  ARCHIVED: 'patient.archived',
} as const;

export type PatientEvent = (typeof PATIENT_EVENTS)[keyof typeof PATIENT_EVENTS];
