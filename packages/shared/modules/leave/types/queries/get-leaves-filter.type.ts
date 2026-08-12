import { z } from 'zod';
import { GetLeavesFilterSchema } from '../../schemas/queries';

export type GetLeavesFilter = z.infer<typeof GetLeavesFilterSchema>;
