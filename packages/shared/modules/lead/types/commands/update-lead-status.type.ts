import { z } from 'zod';
import { UpdateLeadStatusSchema } from '../../schemas/commands';

export type UpdateLeadStatus = z.infer<typeof UpdateLeadStatusSchema>;
