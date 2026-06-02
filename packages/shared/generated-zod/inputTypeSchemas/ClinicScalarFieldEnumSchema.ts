import { z } from 'zod';

export const ClinicScalarFieldEnumSchema = z.enum(['id','name','slug','sectorId','phone','email','address','city','district','consultationSlotDuration','operationMode','status','timezone','logo','organizationId','createdAt','updatedAt','deletedAt']);

export default ClinicScalarFieldEnumSchema;
