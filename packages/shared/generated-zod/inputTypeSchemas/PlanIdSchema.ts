import { z } from 'zod';

export const PlanIdSchema = z.enum(['FREE_TRIAL','BASIC','PREMIUM']);

export type PlanIdType = `${z.infer<typeof PlanIdSchema>}`

export default PlanIdSchema;
