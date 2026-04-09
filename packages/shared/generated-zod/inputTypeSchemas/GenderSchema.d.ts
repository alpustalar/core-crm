import { z } from 'zod';
export declare const GenderSchema: z.ZodEnum<{
    MALE: "MALE";
    FEMALE: "FEMALE";
}>;
export type GenderType = `${z.infer<typeof GenderSchema>}`;
export default GenderSchema;
