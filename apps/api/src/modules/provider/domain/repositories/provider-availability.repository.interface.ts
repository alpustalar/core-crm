import { ProviderAvailability, ProviderException } from '@shared';

export const PROVIDER_AVAILABILITY_REPO_TOKEN = Symbol(
  'IProviderAvailabilityRepository'
);

export type IProviderAvailability = ProviderAvailability;

export interface IProviderAvailabilityCreate {
  id?: string;
  providerId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}

export interface IProviderAvailabilityRepository {
  create(data: IProviderAvailabilityCreate): Promise<IProviderAvailability>;
  findByProviderId(providerId: string): Promise<IProviderAvailability[]>;
  findByProviderAndDay(
    providerId: string,
    dayOfWeek: number
  ): Promise<IProviderAvailability | null>;
  deleteByProviderId(providerId: string): Promise<{ deletedCount: number }>;
  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]>;
}
