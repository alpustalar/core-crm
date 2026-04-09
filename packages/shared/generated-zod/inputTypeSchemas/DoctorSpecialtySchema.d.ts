import { z } from 'zod';
export declare const DoctorSpecialtySchema: z.ZodEnum<{
    GENERAL: "GENERAL";
    ENDODONTIST: "ENDODONTIST";
    PERIODONTIST: "PERIODONTIST";
    ORTHODONTIST: "ORTHODONTIST";
    PROSTHODONTIST: "PROSTHODONTIST";
    PEDODONTIST: "PEDODONTIST";
    ORAL_SURGEON: "ORAL_SURGEON";
    COSMETIC: "COSMETIC";
}>;
export type DoctorSpecialtyType = `${z.infer<typeof DoctorSpecialtySchema>}`;
export default DoctorSpecialtySchema;
