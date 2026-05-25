import { Module } from '@nestjs/common';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { SubscriptionCommandModule } from '@modules/subscription/application/commands/command.module';
import { SubscriptionQueryModule } from '@modules/subscription/application/queries/query.module';
import { SubscriptionPresentationModule } from '@modules/subscription/presentation/subscription.presentation.module';

@Module({
  imports: [
    IyzicoModule,
    SubscriptionCommandModule,
    SubscriptionQueryModule,
    SubscriptionPresentationModule,
  ],
})
export class SubscriptionModule {}
