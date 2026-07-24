import { z } from 'zod';
import { GetMyTasksSchema } from '../../schemas/queries';

export type GetMyTasks = z.infer<typeof GetMyTasksSchema>;
