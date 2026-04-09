import { z } from "zod";
import { DoctorSpecialtySchema, DoctorTitleSchema } from "@shared/generated-zod";
export type DoctorTitle = z.infer<typeof DoctorTitleSchema>;
export type DoctorSpecialty = z.infer<typeof DoctorSpecialtySchema>;
export interface DoctorResponse {
    id: string;
    title?: DoctorTitle;
    specialty: DoctorSpecialty;
    publicPhone?: string;
    publicEmail?: string;
    isActive: boolean;
    createdAt: Date;
    clinicId: string;
    userId: string;
}
