import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';

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
