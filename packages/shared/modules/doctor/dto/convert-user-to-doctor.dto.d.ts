declare const ConvertUserToDoctorDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<import("zod").ZodObject<{
    userId: import("zod").ZodString;
    title: import("zod").ZodOptional<import("zod").ZodEnum<{
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
    specialty: import("zod").ZodLazy<import("zod").ZodEnum<{
        GENERAL: "GENERAL";
        ENDODONTIST: "ENDODONTIST";
        PERIODONTIST: "PERIODONTIST";
        ORTHODONTIST: "ORTHODONTIST";
        PROSTHODONTIST: "PROSTHODONTIST";
        PEDODONTIST: "PEDODONTIST";
        ORAL_SURGEON: "ORAL_SURGEON";
        COSMETIC: "COSMETIC";
    }>>;
    publicPhone: import("zod").ZodOptional<import("zod").ZodString>;
    publicEmail: import("zod").ZodOptional<import("zod").ZodEmail>;
    isActive: import("zod").ZodDefault<import("zod").ZodCoercedBoolean<unknown>>;
    clinicId: import("zod").ZodUUID;
}, import("zod/v4/core").$strip>, false>;
export declare class ConvertUserToDoctorDto extends ConvertUserToDoctorDto_base {
}
export {};
