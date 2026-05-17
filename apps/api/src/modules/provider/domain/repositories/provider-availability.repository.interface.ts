import { ProviderAvailability, ProviderException } from '@shared';
import { CreateProviderAvailabilityProps } from '@modules/provider/domain/types/create-provider-availability.props';
import { ProviderAvailabilityWithCanAcceptExamination } from '@modules/provider/domain/types/provider-availability-with-can-accept-examination';

export const PROVIDER_AVAILABILITY_REPO_TOKEN = Symbol(
  'IProviderAvailabilityRepository'
);

export interface IProviderAvailabilityRepository {
  create(data: CreateProviderAvailabilityProps): Promise<ProviderAvailability>;
  findByProviderId(
    providerId: string
  ): Promise<ProviderAvailabilityWithCanAcceptExamination[]>;
  findByProviderAndDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<ProviderAvailability | null>;
  deleteByProviderId(providerId: string): Promise<{ deletedCount: number }>;
  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]>;
}
