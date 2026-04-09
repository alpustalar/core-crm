import { z } from 'zod';
export declare const DoctorTitleSchema: z.ZodEnum<{
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
}>;
export type DoctorTitleType = `${z.infer<typeof DoctorTitleSchema>}`;
export default DoctorTitleSchema;
