import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';
import { WorkOrderItemSpecsSchema } from '../item-specs.schema';

/** İş emri satırı — sektöre özgü detay `specs` içinde taşınır. */
export const WorkOrderItemInputSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative().nullable().optional(),
  specs: WorkOrderItemSpecsSchema.nullable().optional(),
});
export type WorkOrderItemInput = z.infer<typeof WorkOrderItemInputSchema>;

/** Dış iş emri oluşturma (DRAFT). Tedarikçiye gönderim ayrı komuttur. */
export const CreateExternalWorkOrderSchema = z.object({
  supplierId: z.uuid(),
  patientId: z.uuid().nullable().optional(),
  treatmentId: z.uuid().nullable().optional(),
  providerId: z.uuid().nullable().optional(),
  referenceNo: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  agreedCost: z.number().nonnegative().nullable().optional(),
  currency: CurrencySchema.optional(),
  note: z.string().nullable().optional(),
  items: z.array(WorkOrderItemInputSchema).min(1),
});
