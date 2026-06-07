import { z } from 'zod';
import { UpdatePatientPackageSchema } from '../../schemas/command';
import PatientPackageStatusSchema from '@shared/generated-zod/inputTypeSchemas/PatientPackageStatusSchema';

export type PatientPackageStatus = z.infer<typeof PatientPackageStatusSchema>;
export type UpdatePatientPackage = z.infer<typeof UpdatePatientPackageSchema>;
