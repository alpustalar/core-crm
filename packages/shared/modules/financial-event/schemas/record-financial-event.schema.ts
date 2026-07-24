import { z } from 'zod';
import FinancialEventTypeSchema from '@shared/generated-zod/inputTypeSchemas/FinancialEventTypeSchema';
import InputJsonValueSchema from '@shared/generated-zod/inputTypeSchemas/InputJsonValueSchema';

export const RecordFinancialEventSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(), // defter sahibi şube (source-of-truth)
  type: FinancialEventTypeSchema,
  occurredAt: z.date().optional(),

  payload: InputJsonValueSchema,

  sourceModule: z.string().min(1, 'Kaynak modül belirtilmelidir'),
  sourceRefId: z.string().nullable().optional(),
  dedupeKey: z.string().nullable().optional(),
  performedById: z.uuid().nullable().optional(), // İşlemi yapan kullanıcı ID'si
});

export type RecordFinancialEvent = z.infer<typeof RecordFinancialEventSchema>;
