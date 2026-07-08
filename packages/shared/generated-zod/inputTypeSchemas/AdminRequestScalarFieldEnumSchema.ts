import { z } from 'zod';

export const AdminRequestScalarFieldEnumSchema = z.enum(['id','targetId','organizationId','clinicId','type','status','requestedBy','metadata','reviewedBy','reviewedAt','reviewNote','createdAt','updatedAt']);

export default AdminRequestScalarFieldEnumSchema;
