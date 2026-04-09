import { z } from 'zod';
export declare const TreatmentCategorySchema: z.ZodEnum<{
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
export type TreatmentCategoryType = `${z.infer<typeof TreatmentCategorySchema>}`;
export default TreatmentCategorySchema;
