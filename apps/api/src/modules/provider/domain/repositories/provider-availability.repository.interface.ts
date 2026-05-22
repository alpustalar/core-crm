import { ProviderAvailability, ProviderException, ProviderShift } from '@shared';
import { CreateProviderAvailabilityProps } from '@modules/provider/domain/types/create-provider-availability.props';
import { CreateProviderShiftProps } from '@modules/provider/domain/types/create-provider-shift.props';
import { ProviderAvailabilityWithCanAcceptExamination } from '@modules/provider/domain/types/provider-availability-with-can-accept-examination';

export const PROVIDER_AVAILABILITY_REPOSITORY = Symbol(
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
  findShiftsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderShift[]>;
  upsertManyShifts(data: CreateProviderShiftProps[]): Promise<void>;
}
