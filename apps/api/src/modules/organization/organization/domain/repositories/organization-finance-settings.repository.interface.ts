import { OrganizationFinanceSettings as IOrganizationFinanceSettings } from '@shared';
import { OrganizationFinanceSettings } from '@modules/organization/organization/domain/entities/organization-finance-settings.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const ORGANIZATION_FINANCE_SETTINGS_COMMAND_REPOSITORY = Symbol(
  'IOrganizationFinanceSettingsCommandRepository'
);
export const ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY = Symbol(
  'IOrganizationFinanceSettingsQueryRepository'
);

export type IOrganizationFinanceSettingsCommandRepository =
  IBaseCommandRepository<OrganizationFinanceSettings>;

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IOrganizationFinanceSettingsQueryRepository {
  findByOrganizationId(
    organizationId: string
  ): Promise<IOrganizationFinanceSettings | null>;
}
