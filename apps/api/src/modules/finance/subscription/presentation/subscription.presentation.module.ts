import { Module } from '@nestjs/common';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionCommandModule } from '@modules/finance/subscription/application/commands/command.module';

@Module({
  imports: [SubscriptionCommandModule],
  controllers: [SubscriptionController],
})
export class SubscriptionPresentationModule {}
