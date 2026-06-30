import { z } from 'zod';

export const IyzicoTerminalEodSchema = z.object({
  clinicId: z.uuid(),
  // true → özet gün sonu (detay listesi olmadan)
  useSummary: z.boolean().optional(),
});
