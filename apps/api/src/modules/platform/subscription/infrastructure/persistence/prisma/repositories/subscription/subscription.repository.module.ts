import { Module } from '@nestjs/common';
import { SubscriptionCommandRepository } from './subscription.command.repository';
import { SubscriptionQueryRepository } from './subscription.query.repository';
import { SUBSCRIPTION_COMMAND_REPOSITORY } from '@modules/platform/subscription/domain/repositories/subscription/subscription.command.repository';
import { SUBSCRIPTION_QUERY_REPOSITORY } from '@modules/platform/subscription/domain/repositories/subscription/subscription.query.repository';

@Module({
  providers: [
    {
      provide: SUBSCRIPTION_COMMAND_REPOSITORY,
      useClass: SubscriptionCommandRepository,
    },
    {
      provide: SUBSCRIPTION_QUERY_REPOSITORY,
      useClass: SubscriptionQueryRepository,
    },
  ],
  exports: [SUBSCRIPTION_COMMAND_REPOSITORY, SUBSCRIPTION_QUERY_REPOSITORY],
})
export class SubscriptionRepositoryModule {}
