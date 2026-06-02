import { z } from 'zod';
import { CreateLeadSchema } from '../../schemas/commands';

export type CreateLead = z.infer<typeof CreateLeadSchema>;
