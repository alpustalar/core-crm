import { z } from 'zod';

export const SubStatusSchema = z.enum(['ACTIVE','PAST_DUE','CANCELED','EXPIRED']);

export type SubStatusType = `${z.infer<typeof SubStatusSchema>}`

export default SubStatusSchema;
