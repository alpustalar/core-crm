import { Module } from '@nestjs/common';
import { ProviderAvailabilityCommandRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-availability/provider-availability.command.repository';
import { ProviderAvailabilityQueryRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-availability/provider-availability.query.repository';
import { PROVIDER_AVAILABILITY_COMMAND_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-availability/provider-availability.command.repository';
import { PROVIDER_AVAILABILITY_QUERY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-availability/provider-availability.query.repository';

@Module({
  providers: [
    {
      provide: PROVIDER_AVAILABILITY_COMMAND_REPOSITORY,
      useClass: ProviderAvailabilityCommandRepository,
    },
    {
      provide: PROVIDER_AVAILABILITY_QUERY_REPOSITORY,
      useClass: ProviderAvailabilityQueryRepository,
    },
  ],
  exports: [
    PROVIDER_AVAILABILITY_COMMAND_REPOSITORY,
    PROVIDER_AVAILABILITY_QUERY_REPOSITORY,
  ],
})
export class ProviderAvailabilityRepositoryModule {}
