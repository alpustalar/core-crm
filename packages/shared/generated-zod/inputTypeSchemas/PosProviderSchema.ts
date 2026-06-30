import { z } from 'zod';

export const PosProviderSchema = z.enum(['PAX','IYZICO_TERMINAL']);

export type PosProviderType = `${z.infer<typeof PosProviderSchema>}`

export default PosProviderSchema;
