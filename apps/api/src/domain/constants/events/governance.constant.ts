export const GOVERNANCE_EVENTS = {
  UPSERT_CLINIC_SPECS: 'governance.upsert_clinic_specs',
} as const;

export type GovernanceEvent =
  (typeof GOVERNANCE_EVENTS)[keyof typeof GOVERNANCE_EVENTS];
