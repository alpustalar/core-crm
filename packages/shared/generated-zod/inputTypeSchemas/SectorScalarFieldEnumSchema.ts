import { z } from 'zod';

export const SectorScalarFieldEnumSchema = z.enum(['id','slug','name']);

export default SectorScalarFieldEnumSchema;
