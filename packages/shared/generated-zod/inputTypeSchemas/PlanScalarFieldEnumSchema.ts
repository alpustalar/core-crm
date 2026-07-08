import { z } from 'zod';

export const PlanScalarFieldEnumSchema = z.enum(['id','planId','name','monthlyPrice','currency','isActive','createdAt','updatedAt']);

export default PlanScalarFieldEnumSchema;
