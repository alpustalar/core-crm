import { z } from 'zod';

export const ExternalWorkOrderStatusSchema = z.enum(['DRAFT','SENT','IN_PROGRESS','TRY_IN','READY','DELIVERED','FITTED','CANCELLED']);

export type ExternalWorkOrderStatusType = `${z.infer<typeof ExternalWorkOrderStatusSchema>}`

export default ExternalWorkOrderStatusSchema;
