import { ClinicFinanceSettings } from '@shared';

export const CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY = Symbol(
  'IClinicFinanceSettingsQueryRepository'
);

export interface IClinicFinanceSettingsQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicFinanceSettings | null>;
}
