import { z } from 'zod';

/** İşten çıkış. Tarih verilmezse bugün kabul edilir. */
export const TerminateEmployeeSchema = z.object({
  terminationDate: z.coerce.date().optional(),
});

export type TerminateEmployee = z.infer<typeof TerminateEmployeeSchema>;
