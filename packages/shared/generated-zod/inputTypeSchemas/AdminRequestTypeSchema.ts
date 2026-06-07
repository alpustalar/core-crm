import { z } from 'zod';

export const AdminRequestTypeSchema = z.enum(['CLINIC_DELETION','ORGANIZATION_DELETION']);

export type AdminRequestTypeType = `${z.infer<typeof AdminRequestTypeSchema>}`

export default AdminRequestTypeSchema;
