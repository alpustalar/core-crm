import { z } from 'zod';
import { CreateActivitySchema } from '../../schemas/commands';

export type CreateActivity = z.infer<typeof CreateActivitySchema>;
