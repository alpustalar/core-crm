import { z } from 'zod';

export const BloodTypeSchema = z.enum(['A_POS','A_NEG','B_POS','B_NEG','O_POS','O_NEG','AB_POS','AB_NEG']);

export type BloodTypeType = `${z.infer<typeof BloodTypeSchema>}`

export default BloodTypeSchema;
