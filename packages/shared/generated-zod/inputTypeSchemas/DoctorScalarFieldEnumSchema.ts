import { z } from 'zod';

export const DoctorScalarFieldEnumSchema = z.enum(['id','title','specialty','publicPhone','publicEmail','isActive','createdAt','updatedAt','clinicId','userId']);

export default DoctorScalarFieldEnumSchema;
