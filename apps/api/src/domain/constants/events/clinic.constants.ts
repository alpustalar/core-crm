export const CLINIC_EVENTS = {
  CREATED: 'clinic.created',
  UPDATED: 'clinic.updated',
  MERGED: 'clinic.merged',
  SOFT_DELETED: 'clinic.deleted',
  ACTIVATED: 'clinic.activated',
  DEACTIVATED: 'clinic.deactivated',
} as const;

export type ClinicEvent = (typeof CLINIC_EVENTS)[keyof typeof CLINIC_EVENTS];
