import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetActiveSubscriptionHandler } from './get-active-subscription/get-active-subscription.handler';
import { SubscriptionRepositoryModule } from '@modules/subscription/infrastructure/persistence/prisma/repositories/subscription.repository.module';

const QueryHandlers = [GetActiveSubscriptionHandler];

@Module({
  imports: [CqrsModule, SubscriptionRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class SubscriptionQueryModule {}
