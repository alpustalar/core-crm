import { OrganizationFinanceSettings } from '@modules/organization/organization/domain/entities/organization-finance-settings.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const ORGANIZATION_FINANCE_SETTINGS_COMMAND_REPOSITORY = Symbol(
  'IOrganizationFinanceSettingsCommandRepository'
);

export type IOrganizationFinanceSettingsCommandRepository =
  IBaseCommandRepository<OrganizationFinanceSettings>;
