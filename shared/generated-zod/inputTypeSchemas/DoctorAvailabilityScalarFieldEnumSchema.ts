import { z } from 'zod';

export const DoctorAvailabilityScalarFieldEnumSchema = z.enum(['id','dayOfWeek','startMinute','endMinute','breakStartMinute','breakEndMinute','createdAt','updatedAt','doctorId']);

export default DoctorAvailabilityScalarFieldEnumSchema;
