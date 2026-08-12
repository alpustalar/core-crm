export const ACCOUNTING_EVENTS = {
  TRIAL_BALANCE: 'accounting.report.trial-balance',
  ACCOUNT_LEDGER: 'accounting.report.account-ledger',
  JOURNAL_REPORT: 'accounting.report.journal',
  INCOME_STATEMENT: 'accounting.report.income-statement',
  BALANCE_SHEET: 'accounting.report.balance-sheet',
  CASH_FLOW: 'accounting.report.cash-flow',
  VAT_DECLARATION: 'accounting.report.vat-declaration',
  BANK_LEDGER_LINES: 'accounting.report.bank-ledger-lines',
  JOURNAL_ENTRIES: 'accounting.journal-entries.list',
  CHART_OF_ACCOUNTS: 'accounting.chart-of-accounts.list',
  PERIODS: 'accounting.periods.list',
  PERIOD_BY_DATE: 'accounting.periods.by-date',
  FINANCIAL_EVENTS: 'accounting.financial-events.list',
  FINANCIAL_EVENT_DETAIL: 'accounting.financial-events.detail',
  TAX_PARAMETERS: 'accounting.tax-parameters.list',
} as const;

export type AccountingEvent =
  (typeof ACCOUNTING_EVENTS)[keyof typeof ACCOUNTING_EVENTS];
