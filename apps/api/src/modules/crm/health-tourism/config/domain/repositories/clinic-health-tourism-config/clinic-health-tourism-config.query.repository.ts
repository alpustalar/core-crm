import { ClinicHealthTourismConfig } from '@shared';

export const CLINIC_HEALTH_TOURISM_CONFIG_QUERY_REPOSITORY = Symbol(
  'IClinicHealthTourismConfigQueryRepository'
);

export interface IClinicHealthTourismConfigQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicHealthTourismConfig | null>;
}
