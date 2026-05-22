export const FINANCE_JOBS = {
  PROCESS_LEDGER: 'process-ledger-entry',
  GENERATE_INVOICE: 'generate-invoice',
} as const;

export const ORGANIZATION_JOBS = {
  CLEAN_UP: 'organization-clean-up',
} as const;

export const USER_JOBS = {
  FIREBASE_ROLLBACK: 'firebase-rollback',
} as const;

export const OUTBOX_JOBS = {
  PROCESS: 'process-outbox',
} as const;
