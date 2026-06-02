import { z } from 'zod';
import {
  UpdatePatientPackageSchema,
  PatientPackageStatusSchema,
} from '../../schemas/command';

export type PatientPackageStatus = z.infer<typeof PatientPackageStatusSchema>;
export type UpdatePatientPackage = z.infer<typeof UpdatePatientPackageSchema>;
