import { InvoiceTriggers } from '@modules/finance/invoice/domain/constants/invoice-triggers';

export type InvoiceTrigger =
  (typeof InvoiceTriggers)[keyof typeof InvoiceTriggers];
