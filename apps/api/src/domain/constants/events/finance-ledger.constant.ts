export const FINANCE_LEDGER_EVENTS = {
  PATIENT_SUMMARY: 'finance.patient-summary',
  CLINIC_SUMMARY: 'finance.clinic-summary',
  PATIENT_LEDGER: 'finance.patient-ledger',
  LEDGER: 'finance.ledger',
} as const;

export type FinanceLedgerEvent =
  (typeof FINANCE_LEDGER_EVENTS)[keyof typeof FINANCE_LEDGER_EVENTS];
