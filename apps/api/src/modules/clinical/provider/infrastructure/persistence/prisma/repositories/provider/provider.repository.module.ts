import { Module } from '@nestjs/common';
import { ProviderCommandRepository } from './provider.command.repository';
import { ProviderQueryRepository } from './provider.query.repository';
import { PROVIDER_QUERY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider/provider.query.repository';
import { PROVIDER_COMMAND_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';

@Module({
  providers: [
    {
      provide: PROVIDER_COMMAND_REPOSITORY,
      useClass: ProviderCommandRepository,
    },
    { provide: PROVIDER_QUERY_REPOSITORY, useClass: ProviderQueryRepository },
  ],
  exports: [PROVIDER_COMMAND_REPOSITORY, PROVIDER_QUERY_REPOSITORY],
})
export class ProviderRepositoryModule {}
