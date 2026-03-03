import { z } from 'zod';

export const DoctorTitleSchema = z.enum(['DT','UZM_DT','DR_DT','ASST_PROF_DR','ASSOC_PROF_DR','PROF_DR','ORD_PROF_DR','RES_ASST_DR','CLINIC_CHIEF','CONSULTANT']);

export type DoctorTitleType = `${z.infer<typeof DoctorTitleSchema>}`

export default DoctorTitleSchema;
