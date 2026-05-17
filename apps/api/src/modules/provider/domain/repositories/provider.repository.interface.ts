import { Pagination, Provider } from '@shared';
import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';
import { UpdateProviderDto } from '@shared/modules/provider/dto/update-provider.dto';

export const PROVIDER_REPO_TOKEN = Symbol('IProviderRepository');

export type PaginatedProviders = MapPaginationResult<Provider>;

export interface IProviderRepository {
  create(data: UpdateProviderDto): Promise<Provider>;
  find(providerId: string): Promise<Provider | null>;
  findAllByClinicId(
    pagination: Pagination,
    clinicId: string
  ): Promise<PaginatedProviders>;
  findAllByOrganizationIds(
    pagination: Pagination,
    organizationIds: string[]
  ): Promise<PaginatedProviders>;
  update(providerId: string, data: UpdateProviderDto): Promise<Provider>;
}
