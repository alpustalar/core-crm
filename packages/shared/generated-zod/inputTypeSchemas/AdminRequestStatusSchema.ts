import { z } from 'zod';

export const AdminRequestStatusSchema = z.enum(['PENDING','APPROVED','REJECTED']);

export type AdminRequestStatusType = `${z.infer<typeof AdminRequestStatusSchema>}`

export default AdminRequestStatusSchema;
