import { z } from 'zod';

export const LeaveRequestScalarFieldEnumSchema = z.enum(['id','employeeId','organizationId','clinicId','type','status','startDate','endDate','days','reason','reviewedById','reviewedAt','reviewNote','createdAt','updatedAt']);

export default LeaveRequestScalarFieldEnumSchema;
