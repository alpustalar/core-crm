import { z } from 'zod';
import { CreateModuleSchema } from '../../schemas/commands';

export type CreateModule = z.infer<typeof CreateModuleSchema>;
