import { z } from 'zod';

export const AttendanceRecordScalarFieldEnumSchema = z.enum(['id','employeeId','organizationId','clinicId','workDate','checkInAt','checkOutAt','workedMinutes','overtimeMinutes','status','note','createdAt','updatedAt']);

export default AttendanceRecordScalarFieldEnumSchema;
