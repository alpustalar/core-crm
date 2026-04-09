import { z } from 'zod';
export declare const DoctorAvailabilityScalarFieldEnumSchema: z.ZodEnum<{
    id: "id";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
    doctorId: "doctorId";
    dayOfWeek: "dayOfWeek";
    startMinute: "startMinute";
    endMinute: "endMinute";
    breakStartMinute: "breakStartMinute";
    breakEndMinute: "breakEndMinute";
}>;
export default DoctorAvailabilityScalarFieldEnumSchema;
