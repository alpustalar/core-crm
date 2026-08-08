import { Module } from '@nestjs/common';
import { SubscriptionItemCommandRepository } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-item/subscription-item.command.repository';
import { SUBSCRIPTION_ITEM_COMMAND_REPOSITORY } from '@modules/platform/subscription/domain/repositories/subscription-item/subscription-item.command.repository';

@Module({
  providers: [
    {
      provide: SUBSCRIPTION_ITEM_COMMAND_REPOSITORY,
      useClass: SubscriptionItemCommandRepository,
    },
  ],
  exports: [SUBSCRIPTION_ITEM_COMMAND_REPOSITORY],
})
export class SubscriptionItemRepositoryModule {}
