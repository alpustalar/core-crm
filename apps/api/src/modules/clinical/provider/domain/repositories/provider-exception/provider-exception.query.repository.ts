import { ProviderException } from '@shared';

export const PROVIDER_EXCEPTION_QUERY_REPOSITORY = Symbol(
  'IProviderExceptionQueryRepository'
);

export interface IProviderExceptionQueryRepository {
  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]>;
}
