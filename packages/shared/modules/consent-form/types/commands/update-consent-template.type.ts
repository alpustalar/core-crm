import { z } from 'zod';
import { UpdateConsentTemplateSchema } from '../../schemas/commands';

export type UpdateConsentTemplate = z.infer<typeof UpdateConsentTemplateSchema>;
