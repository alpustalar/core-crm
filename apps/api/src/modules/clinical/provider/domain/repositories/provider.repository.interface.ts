import { Pagination } from '@shared';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const PROVIDER_COMMAND_REPOSITORY = Symbol('IProviderCommandRepository');
export const PROVIDER_QUERY_REPOSITORY = Symbol('IProviderQueryRepository');

export type PaginatedProviders = { items: Provider[]; total: number };

export interface IProviderCommandRepository
  extends IBaseCommandRepository<Provider> {}

export interface IProviderQueryRepository {
  findById(providerId: string): Promise<Provider | null>;
  findAllByClinicId(
    pagination: Pagination,
    clinicId: string
  ): Promise<PaginatedProviders>;
  findAllByOrganizationIds(
    pagination: Pagination,
    organizationIds: string[]
  ): Promise<PaginatedProviders>;
}
