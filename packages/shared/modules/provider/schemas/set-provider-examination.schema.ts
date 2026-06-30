import { z } from 'zod';

export const SetProviderExaminationSchema = z.object({
  acceptsConsultation: z.coerce.boolean(),
});
