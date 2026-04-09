import { z } from 'zod';
export declare const MasterTreatmentSchema: z.ZodObject<{
    category: z.ZodEnum<{
        COSMETIC: "COSMETIC";
        DIAGNOSIS: "DIAGNOSIS";
        RESTORATIVE: "RESTORATIVE";
        SURGERY: "SURGERY";
        PEDODONTICS: "PEDODONTICS";
        PERIODONTOLOGY: "PERIODONTOLOGY";
        PROSTHODONTICS: "PROSTHODONTICS";
        ORTHODONTICS: "ORTHODONTICS";
        OTHER: "OTHER";
    }>;
    id: z.ZodUUID;
    name: z.ZodString;
    defaultDuration: z.ZodNumber;
}, z.core.$strip>;
export type MasterTreatment = z.infer<typeof MasterTreatmentSchema>;
export default MasterTreatmentSchema;
