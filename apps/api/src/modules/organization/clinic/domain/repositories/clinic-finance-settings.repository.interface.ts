import { ClinicFinanceSettings } from '@modules/organization/clinic/domain/entities/clinic-finance-settings.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const CLINIC_FINANCE_SETTINGS_COMMAND_REPOSITORY = Symbol(
  'IClinicFinanceSettingsCommandRepository'
);
export const CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY = Symbol(
  'IClinicFinanceSettingsQueryRepository'
);

export type IClinicFinanceSettingsCommandRepository =
  IBaseCommandRepository<ClinicFinanceSettings>;

export interface IClinicFinanceSettingsQueryRepository {
  findByClinicId(clinicId: string): Promise<ClinicFinanceSettings | null>;
}
