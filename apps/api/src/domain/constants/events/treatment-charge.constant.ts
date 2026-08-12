export const TREATMENT_CHARGE_EVENTS = {
  ADDED: 'treatment-charge.added',
  DISCOUNT_UPDATED: 'treatment-charge.discount.updated',
  VOIDED: 'treatment-charge.voided',
  LIST: 'treatment-charge.list',
  SUMMARY: 'treatment-charge.summary',
} as const;

export type TreatmentChargeEvent =
  (typeof TREATMENT_CHARGE_EVENTS)[keyof typeof TREATMENT_CHARGE_EVENTS];
