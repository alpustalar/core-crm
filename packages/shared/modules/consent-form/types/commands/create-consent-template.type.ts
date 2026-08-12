import { z } from 'zod';
import { CreateConsentTemplateSchema } from '../../schemas/commands';

export type CreateConsentTemplate = z.infer<typeof CreateConsentTemplateSchema>;
