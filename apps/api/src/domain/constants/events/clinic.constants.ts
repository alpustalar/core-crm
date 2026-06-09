export const CLINIC_EVENTS = {
  CREATED: 'clinic.created',
  UPDATED: 'clinic.updated',
  MERGED: 'clinic.merged',
  SOFT_DELETED: 'clinic.deleted',
  SOFT_DELETE_REQUESTED: 'clinic.delete_requested',
  MANY_SOFT_DELETED: 'clinic.many_deleted',
  ACTIVATED: 'clinic.activated',
  DEACTIVATED: 'clinic.deactivated',
  REGISTER_SUBMERCHANT: 'clinic.register_submerchant'
} as const;

export type ClinicEvent = (typeof CLINIC_EVENTS)[keyof typeof CLINIC_EVENTS];
