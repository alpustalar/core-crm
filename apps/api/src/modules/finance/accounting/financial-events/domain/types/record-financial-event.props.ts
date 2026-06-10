import { FinancialEventType, Prisma } from '@prisma/client';

export interface RecordFinancialEventProps {
  id?: string;
  organizationId: string;
  clinicId?: string | null;
  type: FinancialEventType;
  occurredAt?: Date;
  payload: Prisma.InputJsonValue;
  sourceModule: string;
  sourceRefId?: string | null;
  dedupeKey?: string | null;
  performedById?: string | null;
}
