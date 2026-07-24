import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PROVIDER_EXCEPTION_QUERY_REPOSITORY = Symbol(
  'IProviderExceptionQueryRepository'
);

export const PROVIDER_EXCEPTION_COMMAND_REPOSITORY = Symbol(
  'IProviderExceptionCommandRepository'
);

export type IProviderExceptionCommandRepository =
  IBaseCommandRepository<ProviderException>;

export interface IProviderExceptionQueryRepository {
  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]>;
}
