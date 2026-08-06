import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PROVIDER_EXCEPTION_COMMAND_REPOSITORY = Symbol(
  'IProviderExceptionCommandRepository'
);

export interface IProviderExceptionCommandRepository
  extends IBaseCommandRepository<ProviderException> {
  findExceptionsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderException[]>;
}
