import { z } from 'zod';

export const AppointmentDiagnosisScalarFieldEnumSchema = z.enum(['id','appointmentId','icd10Code','description','isPrimary','createdAt']);

export default AppointmentDiagnosisScalarFieldEnumSchema;
