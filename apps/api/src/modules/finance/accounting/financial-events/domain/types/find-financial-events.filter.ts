import { FinancialEventType } from '@prisma/client';

export interface FindFinancialEventsFilter {
  organizationId: string;
  type?: FinancialEventType;
  sourceModule?: string;
  sourceRefId?: string;
}
