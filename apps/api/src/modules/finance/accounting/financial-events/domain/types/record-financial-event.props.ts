import { FinancialEventType, Prisma } from '@prisma/client';

export interface RecordFinancialEventProps {
  id?: string;
  clinicId: string; // defter sahibi şube (source-of-truth)
  organizationId: string; // denormalize — konsolide raporlama
  type: FinancialEventType;
  occurredAt?: Date;
  payload: Prisma.InputJsonValue;
  sourceModule: string;
  sourceRefId?: string | null;
  dedupeKey?: string | null;
  performedById?: string | null;
}
