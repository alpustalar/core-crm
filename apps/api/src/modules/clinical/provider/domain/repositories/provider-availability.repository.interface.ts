import { ProviderAvailabilityWithAcceptsConsultation } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { ProviderAvailability } from '@modules/clinical/provider/domain/entities/provider-availability.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PROVIDER_AVAILABILITY_REPOSITORY = Symbol(
  'IProviderAvailabilityRepository'
);

export const PROVIDER_AVAILABILITY_QUERY_REPOSITORY = Symbol(
  'IProviderAvailabilityQueryRepository'
);

export const PROVIDER_AVAILABILITY_COMMAND_REPOSITORY = Symbol(
  'IProviderAvailabilityCommandRepository'
);

export interface IProviderAvailabilityCommandRepository
  extends IBaseCommandRepository<ProviderAvailability> {
  createMany(data: ProviderAvailability[]): Promise<void>;
  deleteManyByProviderId(providerId: string): Promise<{ deletedCount: number }>;
}

export interface IProviderAvailabilityQueryRepository {
  findManyByProviderId(
    providerId: string
  ): Promise<ProviderAvailabilityWithAcceptsConsultation[]>;
  findByProviderAndDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<ProviderAvailability | null>;
}
