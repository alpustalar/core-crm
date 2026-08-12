import { z } from 'zod';
import { SetPlanModulesSchema } from '../../schemas/commands';

export type SetPlanModules = z.infer<typeof SetPlanModulesSchema>;
