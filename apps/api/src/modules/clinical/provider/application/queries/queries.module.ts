import { Module } from '@nestjs/common';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { PROVIDER_AVAILABILITY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';
import { POLICY_FACTORY } from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { ProviderAvailabilityRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-availability.repository';
import { PolicyFactory } from '@modules/platform/policy/application/policy-factory';
import { ProviderRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider/provider.repository.module';

// Query Handlers
import { FindAllProvidersHandler } from './find-all-providers/find-all-providers.handler';
import { GetProviderScheduleHandler } from './get-provider-schedule/get-provider-schedule.handler';
import { ProviderCanBookOrThrowHandler } from '@modules/clinical/provider/application/queries/provider-can-book-or-throw/provider-can-book-or-throw.handler';

const QueryHandlers = [
  FindAllProvidersHandler,
  GetProviderScheduleHandler,
  ProviderCanBookOrThrowHandler,
];

@Module({
  imports: [PolicyModule, ProviderRepositoryModule],
  providers: [
    ...QueryHandlers,
    {
      provide: PROVIDER_AVAILABILITY_REPOSITORY,
      useClass: ProviderAvailabilityRepository,
    },
    { provide: POLICY_FACTORY, useClass: PolicyFactory },
  ],
  exports: [...QueryHandlers],
})
export class ProviderQueriesModule {}
