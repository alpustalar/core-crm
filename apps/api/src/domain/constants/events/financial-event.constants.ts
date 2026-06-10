export const FINANCIAL_EVENT_EVENTS = {
  RECORDED: 'financial-event.recorded',
} as const;

export type FinancialEventEvent =
  (typeof FINANCIAL_EVENT_EVENTS)[keyof typeof FINANCIAL_EVENT_EVENTS];
