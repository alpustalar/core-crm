import { z } from 'zod';
import { CreateExternalWorkOrderSchema } from '../../schemas/commands';

export type CreateExternalWorkOrder = z.infer<
  typeof CreateExternalWorkOrderSchema
>;
