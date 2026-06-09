export const FINANCE_LEDGER_EVENTS = {
  PATIENT_SUMMARY: 'finance.patient-summary',
  LEDGER: 'finance.ledger',
} as const;

export type FinanceLedgerEvent =
  (typeof FINANCE_LEDGER_EVENTS)[keyof typeof FINANCE_LEDGER_EVENTS];
