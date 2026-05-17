import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionCommandModule } from '@modules/subscription/application/commands/command.module';

@Module({
  imports: [CqrsModule, SubscriptionCommandModule],
  controllers: [SubscriptionController],
})
export class SubscriptionPresentationModule {}
