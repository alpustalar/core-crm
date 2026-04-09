import { z } from 'zod';
export declare const AppointmentSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CONFIRMED: "CONFIRMED";
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        PENDING: "PENDING";
        NOSHOW: "NOSHOW";
    }>;
    externalSystem: z.ZodNullable<z.ZodEnum<{
        WHATSAPP: "WHATSAPP";
        N8N: "N8N";
        GOOGLE_CALENDAR: "GOOGLE_CALENDAR";
    }>>;
    id: z.ZodUUID;
    patientName: z.ZodString;
    patientPhone: z.ZodString;
    patientEmail: z.ZodNullable<z.ZodString>;
    startTime: z.ZodCoercedDate<unknown>;
    endTime: z.ZodCoercedDate<unknown>;
    treatmentType: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    canceledAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    canceledBy: z.ZodNullable<z.ZodString>;
    cancelReason: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
    externalId: z.ZodNullable<z.ZodString>;
    treatmentId: z.ZodString;
    clinicId: z.ZodString;
    doctorId: z.ZodString;
    patientId: z.ZodNullable<z.ZodString>;
    isDeleted: z.ZodBoolean;
    deletedAt: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export default AppointmentSchema;
