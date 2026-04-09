import { z } from "zod";
export declare const CreateDoctorSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodEnum<{
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
    specialty: z.ZodLazy<z.ZodEnum<{
        GENERAL: "GENERAL";
        ENDODONTIST: "ENDODONTIST";
        PERIODONTIST: "PERIODONTIST";
        ORTHODONTIST: "ORTHODONTIST";
        PROSTHODONTIST: "PROSTHODONTIST";
        PEDODONTIST: "PEDODONTIST";
        ORAL_SURGEON: "ORAL_SURGEON";
        COSMETIC: "COSMETIC";
    }>>;
    publicPhone: z.ZodOptional<z.ZodString>;
    publicEmail: z.ZodOptional<z.ZodEmail>;
    isActive: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
    clinicId: z.ZodUUID;
}, z.core.$strip>;
