import { z } from 'zod';

export const PatientScalarFieldEnumSchema = z.enum(['id','clinicId','sectorId','firstName','lastName','tcNo','birthDate','gender','phone','alternativePhone','email','address','emergencyContact','allergies','chronicDiseases','bloodType','status','createdAt','updatedAt','deletedAt']);

export default PatientScalarFieldEnumSchema;
