import { z } from 'zod';
import { UpdateActivitySchema } from '../../schemas/commands';

export type UpdateActivity = z.infer<typeof UpdateActivitySchema>;
