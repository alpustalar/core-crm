import { z } from "zod";
export declare const CreateAppointmentSchema: z.ZodObject<{
    patientId: z.ZodUUID;
    doctorId: z.ZodUUID;
    treatmentId: z.ZodUUID;
    startTime: z.ZodCoercedDate<unknown>;
    duration: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodUUID>;
    externalId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
