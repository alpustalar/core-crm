import { z } from 'zod';

/** Kasa oturumu açma (açılış nakdiyle). Para birimi kasadan türetilir. */
export const OpenCashSessionSchema = z.object({
  cashRegisterId: z.uuid(),
  openingFloat: z.number().nonnegative(),
  note: z.string().nullable().optional(),
});
