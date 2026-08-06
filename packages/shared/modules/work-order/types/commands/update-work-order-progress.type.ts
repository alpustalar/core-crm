import { z } from 'zod';
import { UpdateWorkOrderProgressSchema } from '../../schemas/commands';

export type UpdateWorkOrderProgress = z.infer<
  typeof UpdateWorkOrderProgressSchema
>;
