import { SubscriptionCommandModule } from '@modules/platform/subscription/application/commands/command.module';
import { SubscriptionQueryModule } from '@modules/platform/subscription/application/queries/query.module';
import { SubscriptionPresentationModule } from '@modules/platform/subscription/presentation/subscription.presentation.module';
import { SubscriptionQueueModule } from '@modules/platform/subscription/infrastructure/queue/subscription-queue.module';
import { SubscriptionEventModule } from '@modules/platform/subscription/infrastructure/events/subscription-event.module';
import { Module } from '@nestjs/common';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';

@Module({
  imports: [
    PosInfrastructureModule,
    SubscriptionCommandModule,
    SubscriptionQueryModule,
    SubscriptionPresentationModule,
    SubscriptionQueueModule,
    SubscriptionEventModule,
  ],
})
export class SubscriptionModule {}
