import { z } from 'zod';

export const CapabilityScalarFieldEnumSchema = z.enum(['id','name','module','action']);

export default CapabilityScalarFieldEnumSchema;
