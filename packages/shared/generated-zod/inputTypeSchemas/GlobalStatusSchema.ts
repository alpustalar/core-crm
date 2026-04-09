import { z } from 'zod';

export const GlobalStatusSchema = z.enum(['ACTIVE','DELETED','SUSPENDED','TRIAL']);

export type GlobalStatusType = `${z.infer<typeof GlobalStatusSchema>}`

export default GlobalStatusSchema;
