import { z } from 'zod';
import { GetConsentTemplatesFilterSchema } from '../../schemas/queries';

export type GetConsentTemplatesFilter = z.infer<typeof GetConsentTemplatesFilterSchema>;
