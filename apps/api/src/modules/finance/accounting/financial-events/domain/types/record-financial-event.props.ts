import { InputJsonValueType } from '@input-type-schemas/InputJsonValueSchema';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

export interface RecordFinancialEventProps {
  id?: string;
  clinicId: string; // defter sahibi şube (source-of-truth)
  organizationId: string; // denormalize — konsolide raporlama
  type: FinancialEventType;
  occurredAt?: Date;
  payload: InputJsonValueType;
  sourceModule: string;
  sourceRefId?: string | null;
  dedupeKey?: string | null;
  performedById?: string | null;
}
