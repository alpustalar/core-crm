import { z } from 'zod';

export const ModuleScalarFieldEnumSchema = z.enum(['id','key','name','description','monthlyPrice','isActive']);

export default ModuleScalarFieldEnumSchema;
