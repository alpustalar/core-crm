import { z } from 'zod';
export declare const PatientSchema: z.ZodObject<{
    gender: z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>;
    bloodType: z.ZodNullable<z.ZodEnum<{
        A_POS: "A_POS";
        A_NEG: "A_NEG";
        B_POS: "B_POS";
        B_NEG: "B_NEG";
        O_POS: "O_POS";
        O_NEG: "O_NEG";
        AB_POS: "AB_POS";
        AB_NEG: "AB_NEG";
    }>>;
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        ARCHIVED: "ARCHIVED";
        DECEASED: "DECEASED";
        BLACKLISTED: "BLACKLISTED";
    }>;
    id: z.ZodUUID;
    clinicId: z.ZodNullable<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    tcNo: z.ZodNullable<z.ZodString>;
    birthDate: z.ZodNullable<z.ZodCoercedDate<unknown>>;
    phone: z.ZodString;
    alternativePhone: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    address: z.ZodNullable<z.ZodString>;
    emergencyContact: z.ZodNullable<z.ZodString>;
    allergies: z.ZodNullable<z.ZodString>;
    chronicDiseases: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
    deletedAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type Patient = z.infer<typeof PatientSchema>;
export default PatientSchema;
