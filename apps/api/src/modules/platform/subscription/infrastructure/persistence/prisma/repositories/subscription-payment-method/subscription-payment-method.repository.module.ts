import { Module } from '@nestjs/common';

import { SubscriptionPaymentMethodCommandRepository } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-payment-method/subscription-payment-method.command.repository';
import { SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY } from '@modules/platform/subscription/domain/repositories/subscription-payment-method/subscription-payment-method.command.repository';

@Module({
  providers: [
    {
      provide: SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
      useClass: SubscriptionPaymentMethodCommandRepository,
    },
  ],
  exports: [SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY],
})
export class SubscriptionPaymentMethodRepositoryModule {}
