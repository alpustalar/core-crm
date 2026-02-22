import { z } from 'zod';

export const ClinicScalarFieldEnumSchema = z.enum(['id','name','slug','phone','email','address','city','district','status','timezone','logo','organizationId','createdAt','updatedAt','deletedAt']);

export default ClinicScalarFieldEnumSchema;
