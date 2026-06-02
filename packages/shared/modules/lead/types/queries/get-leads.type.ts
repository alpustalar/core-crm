import { z } from 'zod';
import { GetLeadsSchema } from '../../schemas/queries';

export type GetLeads = z.infer<typeof GetLeadsSchema>;
