import { ProviderAvailability } from '@shared';
import { ProviderAvailabilityWithAcceptsConsultation } from '@modules/clinical/provider/domain/contracts';

export const PROVIDER_AVAILABILITY_QUERY_REPOSITORY = Symbol(
  'IProviderAvailabilityQueryRepository'
);

export interface IProviderAvailabilityQueryRepository {
  findByProviderAndDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<ProviderAvailability | null>;

  findManyByProviderId(
    providerId: string
  ): Promise<ProviderAvailabilityWithAcceptsConsultation[]>;
}
