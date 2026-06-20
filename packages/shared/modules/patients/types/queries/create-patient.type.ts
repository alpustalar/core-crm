import { z } from 'zod';
import { CreatePatientSchema } from '@shared/modules/patients/schemas/queries/create-patient.schema';

export type CreatePatient = z.infer<typeof CreatePatientSchema>;
