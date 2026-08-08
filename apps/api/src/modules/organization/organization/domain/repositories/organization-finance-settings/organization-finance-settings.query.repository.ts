import { OrganizationFinanceSettings as IOrganizationFinanceSettings } from '@shared';

export const ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY = Symbol(
  'IOrganizationFinanceSettingsQueryRepository'
);

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IOrganizationFinanceSettingsQueryRepository {
  findByOrganizationId(
    organizationId: string
  ): Promise<IOrganizationFinanceSettings | null>;
}
