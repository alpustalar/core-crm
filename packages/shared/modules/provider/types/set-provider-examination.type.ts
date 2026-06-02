import { z } from 'zod';
import { SetProviderExaminationSchema } from '../schemas/set-provider-examination.schema';

export type SetProviderExamination = z.infer<typeof SetProviderExaminationSchema>;
