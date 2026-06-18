import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

export interface FindFinancialEventsFilter {
  organizationId: string;
  type?: FinancialEventType;
  sourceModule?: string;
  sourceRefId?: string;
}
