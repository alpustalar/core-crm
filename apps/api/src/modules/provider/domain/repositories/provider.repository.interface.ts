import { Pagination } from '@shared';
import { Provider } from '@modules/provider/domain/entities/provider.entity';
import { ConvertUserToProviderDto } from '@shared/modules/provider/dto/convert-user-to-provider.dto';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const PROVIDER_COMMAND_REPOSITORY = Symbol('IProviderCommandRepository');
export const PROVIDER_QUERY_REPOSITORY = Symbol('IProviderQueryRepository');

export type PaginatedProviders = { items: Provider[]; total: number };

export interface IProviderCommandRepository
  extends IBaseCommandRepository<Provider> {
  create(data: ConvertUserToProviderDto): Promise<Provider>;
  update(providerId: string, data: UpdateProviderInfoDto): Promise<Provider>;
  softDelete(providerId: string): Promise<void>;
}

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
