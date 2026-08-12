import { z } from 'zod';
import { SignConsentFormSchema } from '../../schemas/commands';

export type SignConsentForm = z.infer<typeof SignConsentFormSchema>;
