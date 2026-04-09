import { z } from 'zod';
export declare const DoctorSchema: z.ZodObject<{
    title: z.ZodNullable<z.ZodEnum<{
        DT: "DT";
        UZM_DT: "UZM_DT";
        DR_DT: "DR_DT";
        ASST_PROF_DR: "ASST_PROF_DR";
        ASSOC_PROF_DR: "ASSOC_PROF_DR";
        PROF_DR: "PROF_DR";
        ORD_PROF_DR: "ORD_PROF_DR";
        RES_ASST_DR: "RES_ASST_DR";
        CLINIC_CHIEF: "CLINIC_CHIEF";
        CONSULTANT: "CONSULTANT";
    }>>;
    specialty: z.ZodEnum<{
        GENERAL: "GENERAL";
        ENDODONTIST: "ENDODONTIST";
        PERIODONTIST: "PERIODONTIST";
        ORTHODONTIST: "ORTHODONTIST";
        PROSTHODONTIST: "PROSTHODONTIST";
        PEDODONTIST: "PEDODONTIST";
        ORAL_SURGEON: "ORAL_SURGEON";
        COSMETIC: "COSMETIC";
    }>;
    id: z.ZodUUID;
    publicPhone: z.ZodNullable<z.ZodString>;
    publicEmail: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
    clinicId: z.ZodString;
    userId: z.ZodString;
}, z.core.$strip>;
export type Doctor = z.infer<typeof DoctorSchema>;
export default DoctorSchema;
