import { Module } from '@nestjs/common';
import { SubscriptionCommandModule } from '@modules/finance/subscription/application/commands/command.module';
import { SubscriptionQueryModule } from '@modules/finance/subscription/application/queries/query.module';
import { SubscriptionPresentationModule } from '@modules/finance/subscription/presentation/subscription.presentation.module';

@Module({
  imports: [
    IyzicoModule,
    SubscriptionCommandModule,
    SubscriptionQueryModule,
    SubscriptionPresentationModule,
  ],
})
export class SubscriptionModule {}
