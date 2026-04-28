import { z } from "zod";
export declare const UpdateDoctorSchema: z.ZodLazy<z.ZodObject<{
    title: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
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
    }>>>;
    specialty: z.ZodOptional<z.ZodLazy<z.ZodEnum<{
        GENERAL: "GENERAL";
        ENDODONTIST: "ENDODONTIST";
        PERIODONTIST: "PERIODONTIST";
        ORTHODONTIST: "ORTHODONTIST";
        PROSTHODONTIST: "PROSTHODONTIST";
        PEDODONTIST: "PEDODONTIST";
        ORAL_SURGEON: "ORAL_SURGEON";
        COSMETIC: "COSMETIC";
    }>>>;
    publicPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    publicEmail: z.ZodOptional<z.ZodOptional<z.ZodEmail>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodCoercedBoolean<unknown>>>;
    clinicId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>>;
declare const UpdateDoctorDto_base: import("node_modules/nestjs-zod/dist/dto-D-BwC0n0.cjs").t<z.ZodLazy<z.ZodObject<{
    title: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
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
    }>>>;
    specialty: z.ZodOptional<z.ZodLazy<z.ZodEnum<{
        GENERAL: "GENERAL";
        ENDODONTIST: "ENDODONTIST";
        PERIODONTIST: "PERIODONTIST";
        ORTHODONTIST: "ORTHODONTIST";
        PROSTHODONTIST: "PROSTHODONTIST";
        PEDODONTIST: "PEDODONTIST";
        ORAL_SURGEON: "ORAL_SURGEON";
        COSMETIC: "COSMETIC";
    }>>>;
    publicPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    publicEmail: z.ZodOptional<z.ZodOptional<z.ZodEmail>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodCoercedBoolean<unknown>>>;
    clinicId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>>, false>;
export declare class UpdateDoctorDto extends UpdateDoctorDto_base {
}
export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;
export {};
