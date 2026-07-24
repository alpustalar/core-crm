import { z } from 'zod';

export const EmployeeStatusSchema = z.enum(['ACTIVE','ON_LEAVE','TERMINATED']);

export type EmployeeStatusType = `${z.infer<typeof EmployeeStatusSchema>}`

export default EmployeeStatusSchema;
