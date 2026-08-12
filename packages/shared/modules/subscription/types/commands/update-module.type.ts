import { z } from 'zod';
import { UpdateModuleSchema } from '../../schemas/commands';

export type UpdateModule = z.infer<typeof UpdateModuleSchema>;
