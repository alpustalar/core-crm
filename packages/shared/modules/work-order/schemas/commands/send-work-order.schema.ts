import { z } from 'zod';

/** Tedarikçiye gönderim — termin (dueDate) bu adımda zorunlu olur. */
export const SendWorkOrderSchema = z.object({
  dueDate: z.coerce.date(),
  referenceNo: z.string().nullable().optional(),
});
