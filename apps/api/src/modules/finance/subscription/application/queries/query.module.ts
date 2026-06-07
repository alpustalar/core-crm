import { Module } from '@nestjs/common';
import { GetActiveSubscriptionHandler } from './get-active-subscription/get-active-subscription.handler';
import { SubscriptionRepositoryModule } from '@modules/finance/subscription/infrastructure/persistence/prisma/repositories/subscription.repository.module';

const QueryHandlers = [GetActiveSubscriptionHandler];

@Module({
  imports: [SubscriptionRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class SubscriptionQueryModule {}
