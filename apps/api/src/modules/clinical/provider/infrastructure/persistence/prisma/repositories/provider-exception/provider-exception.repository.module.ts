import { Module } from '@nestjs/common';
import { PROVIDER_EXCEPTION_QUERY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-exception.repository.interface';
import { ProviderExceptionQueryRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-exception/provider-exception.query.repository';

@Module({
  providers: [
    {
      provide: PROVIDER_EXCEPTION_QUERY_REPOSITORY,
      useClass: ProviderExceptionQueryRepository,
    },
  ],
  exports: [PROVIDER_EXCEPTION_QUERY_REPOSITORY],
})
export class ProviderExceptionRepositoryModule {}
