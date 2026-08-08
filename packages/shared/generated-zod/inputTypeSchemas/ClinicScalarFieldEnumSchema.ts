import { z } from 'zod';

export const ClinicScalarFieldEnumSchema = z.enum(['id','organizationId','sectorId','name','slug','phone','email','address','city','district','latitude','longitude','consultationSlotDuration','status','timezone','isPlatform','logo','createdAt','updatedAt','deletedAt']);

export default ClinicScalarFieldEnumSchema;
