import { z } from 'zod';

export const SetProviderExaminationSchema = z.object({
  canAcceptExamination: z.coerce.boolean(),
});
