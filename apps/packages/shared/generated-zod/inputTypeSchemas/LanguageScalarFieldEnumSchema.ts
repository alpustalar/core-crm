import { z } from 'zod';

export const LanguageScalarFieldEnumSchema = z.enum(['id','code','name','direction','isActive']);

export default LanguageScalarFieldEnumSchema;
