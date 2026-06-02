import { z } from 'zod';

export const OutboxScalarFieldEnumSchema = z.enum(['id','type','payload','createdAt','processedAt']);

export default OutboxScalarFieldEnumSchema;
