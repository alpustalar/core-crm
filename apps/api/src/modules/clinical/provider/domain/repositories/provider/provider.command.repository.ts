import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const PROVIDER_COMMAND_REPOSITORY = Symbol('IProviderCommandRepository');

export type IProviderCommandRepository = IBaseCommandRepository<Provider>;
