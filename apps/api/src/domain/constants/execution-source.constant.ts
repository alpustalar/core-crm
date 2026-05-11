export const ExecutionSources = {
  USER_ACTION: 'USER_ACTION',
  INTERNAL_CASCADE: 'INTERNAL_CASCADE',
  SYSTEM_CRON: 'SYSTEM_CRON',
  DATA_IMPORT: 'DATA_IMPORT',
} as const;

export type ExecutionSource =
  (typeof ExecutionSources)[keyof typeof ExecutionSources];
