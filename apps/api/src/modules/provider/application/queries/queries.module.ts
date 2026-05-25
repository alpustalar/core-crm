import { Module } from '@nestjs/common';
import { PolicyModule } from '@modules/policy/policy.module';
import { PROVIDER_AVAILABILITY_REPOSITORY } from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import { POLICY_FACTORY } from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ProviderAvailabilityRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider-availability.repository';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ProviderRepositoryModule } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider/provider.repository.module';

// Query Handlers
import { FindAllProvidersHandler } from './find-all-providers/find-all-providers.handler';
import { GetProviderScheduleHandler } from './get-provider-schedule/get-provider-schedule.handler';
import { AssertProviderCanBookOrThrowHandler } from './assert-provider-can-book/assert-provider-can-book-or-throw.handler';

const QueryHandlers = [
  FindAllProvidersHandler,
  GetProviderScheduleHandler,
  AssertProviderCanBookOrThrowHandler,
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
