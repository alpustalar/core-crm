import {
  ProviderAvailability,
  ProviderException,
  ProviderShift,
} from '@shared';
import {
  CreateProviderAvailabilityData,
  CreateProviderShiftData,
  ProviderAvailabilityWithCanAcceptExamination,
} from '@modules/clinical/provider/domain/provider.contracts';

export const PROVIDER_AVAILABILITY_REPOSITORY = Symbol(
  'IProviderAvailabilityRepository'
);

export interface IProviderAvailabilityRepository {
  create(data: CreateProviderAvailabilityData): Promise<ProviderAvailability>;
  createMany(data: CreateProviderAvailabilityData[]): Promise<void>;
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
  upsertManyShifts(data: CreateProviderShiftData[]): Promise<void>;
}
