import { z } from 'zod';
export declare const BloodTypeSchema: z.ZodEnum<{
    A_POS: "A_POS";
    A_NEG: "A_NEG";
    B_POS: "B_POS";
    B_NEG: "B_NEG";
    O_POS: "O_POS";
    O_NEG: "O_NEG";
    AB_POS: "AB_POS";
    AB_NEG: "AB_NEG";
}>;
export type BloodTypeType = `${z.infer<typeof BloodTypeSchema>}`;
export default BloodTypeSchema;
