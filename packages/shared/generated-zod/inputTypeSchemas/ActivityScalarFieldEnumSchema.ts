import { z } from 'zod';

export const ActivityScalarFieldEnumSchema = z.enum(['id','clinicId','organizationId','leadId','patientId','type','status','subject','notes','assignedToId','createdById','dueAt','completedAt','createdAt','updatedAt']);

export default ActivityScalarFieldEnumSchema;
