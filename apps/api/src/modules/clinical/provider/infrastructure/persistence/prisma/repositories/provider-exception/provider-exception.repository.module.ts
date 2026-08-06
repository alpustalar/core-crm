import { Module } from '@nestjs/common';

import { ProviderExceptionQueryRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-exception/provider-exception.query.repository';
import { PROVIDER_EXCEPTION_QUERY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-exception/provider-exception.query.repository.interface';
import { PROVIDER_EXCEPTION_COMMAND_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-exception/provider-exception.command.repository.interface';
import { ProviderExceptionCommandRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-exception/provider-exception.command.repository';

@Module({
  providers: [
    {
      provide: PROVIDER_EXCEPTION_QUERY_REPOSITORY,
      useClass: ProviderExceptionQueryRepository,
    },
    {
      provide: PROVIDER_EXCEPTION_COMMAND_REPOSITORY,
      useClass: ProviderExceptionCommandRepository,
    },
  ],
  exports: [
    PROVIDER_EXCEPTION_QUERY_REPOSITORY,
    PROVIDER_EXCEPTION_COMMAND_REPOSITORY,
  ],
})
export class ProviderExceptionRepositoryModule {}
