import { z } from 'zod';

/** Klinik teslim aldı. Kesinleşen ücret farklıysa `actualCost` ile güncellenir. */
export const ReceiveWorkOrderSchema = z.object({
  actualCost: z.number().nonnegative().nullable().optional(),
});
