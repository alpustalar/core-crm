import { Pagination, Provider } from '@shared';
import { Paginated } from '@common/interfaces/paginated.type';
import { ProviderDirectoryEntry } from '@modules/clinical/provider/domain/contracts/provider.contracts';

export const PROVIDER_QUERY_REPOSITORY = Symbol('IProviderQueryRepository');

export interface IProviderQueryRepository {
  findById(providerId: string): Promise<Provider | null>;
  findManyByClinicIds(
    pagination: Pagination,
    clinicIds: string[] | string
  ): Promise<Paginated<Provider>>;
  findManyByOrganizationId(
    pagination: Pagination,
    organizationIds: string[] | string
  ): Promise<Paginated<Provider>>;
  /** Read-model: kliniğin aktif provider'ları + uzmanlık/unvan adları (çeviriden çözülmüş). */
  findDirectoryByClinicId(clinicId: string): Promise<ProviderDirectoryEntry[]>;
}
