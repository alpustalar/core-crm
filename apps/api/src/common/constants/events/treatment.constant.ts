export const TREATMENT_EVENTS = {
  CREATED: 'treatment.created',
  UPDATED: 'treatment.updated',
  SOFT_DELETED: 'treatment.deleted',
} as const;

export type TreatmentEvent =
  (typeof TREATMENT_EVENTS)[keyof typeof TREATMENT_EVENTS];
