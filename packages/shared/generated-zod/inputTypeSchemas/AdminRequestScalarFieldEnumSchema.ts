import { z } from 'zod';

export const AdminRequestScalarFieldEnumSchema = z.enum(['id','type','status','targetId','requestedBy','organizationId','clinicId','metadata','reviewedBy','reviewedAt','reviewNote','createdAt','updatedAt']);

export default AdminRequestScalarFieldEnumSchema;
