import { z } from 'zod';
export declare const MedicalFileSchema: z.ZodObject<{
    fileType: z.ZodEnum<{
        OTHER: "OTHER";
        XRAY: "XRAY";
        PRESCRIPTION: "PRESCRIPTION";
        PHOTO: "PHOTO";
        CONSENT_FORM: "CONSENT_FORM";
        LAB_RESULT: "LAB_RESULT";
    }>;
    id: z.ZodUUID;
    clinicId: z.ZodString;
    patientId: z.ZodString;
    doctorId: z.ZodString;
    appointmentId: z.ZodNullable<z.ZodString>;
    treatmentId: z.ZodString;
    fileName: z.ZodString;
    fileUrl: z.ZodString;
}, z.core.$strip>;
export type MedicalFile = z.infer<typeof MedicalFileSchema>;
export default MedicalFileSchema;
