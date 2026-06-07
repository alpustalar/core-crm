import { z } from 'zod';

export const PatientGroupScalarFieldEnumSchema = z.enum(['id','clinicId','name','description','color','createdAt','updatedAt','deletedAt']);

export default PatientGroupScalarFieldEnumSchema;
