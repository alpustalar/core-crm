import { z } from 'zod';
import { Prisma } from '@prisma/client';
export declare const DoctorTreatmentSchema: z.ZodObject<{
    id: z.ZodUUID;
    customPrice: z.ZodNullable<z.ZodCustom<Prisma.Decimal, Prisma.Decimal>>;
    customDuration: z.ZodNullable<z.ZodNumber>;
    isActive: z.ZodBoolean;
    updatedAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    createdAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    doctorId: z.ZodString;
    treatmentId: z.ZodString;
}, z.core.$strip>;
export type DoctorTreatment = z.infer<typeof DoctorTreatmentSchema>;
export default DoctorTreatmentSchema;
