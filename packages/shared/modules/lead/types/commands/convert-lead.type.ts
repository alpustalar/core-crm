import { z } from 'zod';
import { ConvertLeadSchema } from '../../schemas/commands';

export type ConvertLead = z.infer<typeof ConvertLeadSchema>;
