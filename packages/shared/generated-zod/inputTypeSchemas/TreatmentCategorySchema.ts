import { z } from 'zod';

export const TreatmentCategorySchema = z.enum(['DIAGNOSIS','RESTORATIVE','SURGERY','PEDODONTICS','PERIODONTOLOGY','PROSTHODONTICS','ORTHODONTICS','COSMETIC','OTHER']);

export type TreatmentCategoryType = `${z.infer<typeof TreatmentCategorySchema>}`

export default TreatmentCategorySchema;
