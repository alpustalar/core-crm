import { z } from 'zod';
import { GetMetaLeadsSchema } from '../../schemas/queries';

export type GetMetaLeads = z.infer<typeof GetMetaLeadsSchema>;
