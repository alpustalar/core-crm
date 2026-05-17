import { z } from "zod";
export declare const UpdateUserByActorSchema: z.ZodLazy<z.ZodObject<{
    email: z.ZodOptional<z.ZodEmail>;
    displayName: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    doctorProfile: z.ZodOptional<z.ZodLazy<z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>>>;
    roleId: z.ZodOptional<z.ZodUUID>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DELETED: "DELETED";
        SUSPENDED: "SUSPENDED";
    }>>;
    picture: z.ZodOptional<z.ZodURL>;
    clinicId: z.ZodOptional<z.ZodUUID>;
    managedClinicIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    ownedOrganizationIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
}, z.core.$strip>>;
