import { z } from 'zod';

/** "Görevlerim" listesi filtresi. status verilmezse PENDING kabul edilir. */
export const GetMyTasksSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
});
