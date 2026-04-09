import { z } from 'zod';
export declare const DoctorAvailabilitySchema: z.ZodObject<{
    id: z.ZodUUID;
    dayOfWeek: z.ZodNumber;
    startMinute: z.ZodNumber;
    endMinute: z.ZodNumber;
    breakStartMinute: z.ZodNullable<z.ZodNumber>;
    breakEndMinute: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    doctorId: z.ZodString;
}, z.core.$strip>;
export type DoctorAvailability = z.infer<typeof DoctorAvailabilitySchema>;
export default DoctorAvailabilitySchema;
