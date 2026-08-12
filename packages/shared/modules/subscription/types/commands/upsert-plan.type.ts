import { z } from 'zod';
import { UpsertPlanSchema } from '../../schemas/commands';

export type UpsertPlan = z.infer<typeof UpsertPlanSchema>;
