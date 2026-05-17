import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetActiveSubscriptionHandler } from './get-active-subscription/get-active-subscription.handler';
import { SUBSCRIPTION_REPO_TOKEN } from '@modules/subscription/domain/repositories/subscription.repository.interface';
import { SubscriptionRepository } from '@modules/subscription/infrastructure/persistence/prisma/repositories/subscription.repository';

const QueryHandlers = [GetActiveSubscriptionHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
    {
      provide: SUBSCRIPTION_REPO_TOKEN,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [...QueryHandlers],
})
export class SubscriptionQueryModule {}
