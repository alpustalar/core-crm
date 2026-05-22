import { Module } from '@nestjs/common';
import {
  PROVIDER_COMMAND_REPOSITORY,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { ProviderCommandRepository } from './provider.command.repository';
import { ProviderQueryRepository } from './provider.query.repository';

@Module({
  providers: [
    { provide: PROVIDER_COMMAND_REPOSITORY, useClass: ProviderCommandRepository },
    { provide: PROVIDER_QUERY_REPOSITORY, useClass: ProviderQueryRepository },
  ],
  exports: [PROVIDER_COMMAND_REPOSITORY, PROVIDER_QUERY_REPOSITORY],
})
export class ProviderRepositoryModule {}
