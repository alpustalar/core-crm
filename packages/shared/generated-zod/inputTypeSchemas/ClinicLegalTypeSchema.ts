import { z } from 'zod';

export const ClinicLegalTypeSchema = z.enum(['SERBEST_MESLEK','KURUM']);

export type ClinicLegalTypeType = `${z.infer<typeof ClinicLegalTypeSchema>}`

export default ClinicLegalTypeSchema;
