import { z } from 'zod';

export const VisitTypeSchema = z.enum(['SCHEDULED','WALK_IN','REFERRAL']);

export type VisitTypeType = `${z.infer<typeof VisitTypeSchema>}`

export default VisitTypeSchema;
