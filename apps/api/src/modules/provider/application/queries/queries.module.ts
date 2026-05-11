import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PolicyModule } from '@modules/policy/policy.module';
import { PROVIDER_REPO_TOKEN } from '@modules/provider/domain/repositories/provider.repository.interface';
import { PROVIDER_AVAILABILITY_REPO_TOKEN } from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import { POLICY_FACTORY_TOKEN } from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ProviderRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider.repository';
import { ProviderAvailabilityRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider-availability.repository';
import { PolicyFactory } from '@modules/policy/application/policy-factory';

// Query Handlers
import { FindAllProvidersHandler } from './find-all-providers/find-all-providers.handler';
import { GetProviderScheduleHandler } from './get-provider-schedule/get-provider-schedule.handler';

const QueryHandlers = [FindAllProvidersHandler, GetProviderScheduleHandler];

@Module({
  imports: [CqrsModule, PolicyModule],
  providers: [
    ...QueryHandlers,
    { provide: PROVIDER_REPO_TOKEN, useClass: ProviderRepository },
    { provide: PROVIDER_AVAILABILITY_REPO_TOKEN, useClass: ProviderAvailabilityRepository },
    { provide: POLICY_FACTORY_TOKEN, useClass: PolicyFactory },
  ],
  exports: [...QueryHandlers],
})
export class ProviderQueriesModule {}
