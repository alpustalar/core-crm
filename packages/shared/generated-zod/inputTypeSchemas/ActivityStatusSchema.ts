import { z } from 'zod';

export const ActivityStatusSchema = z.enum(['PENDING','COMPLETED','CANCELLED']);

export type ActivityStatusType = `${z.infer<typeof ActivityStatusSchema>}`

export default ActivityStatusSchema;
