import { Module } from '@nestjs/common';
import {
  SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
  SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import { SubscriptionPaymentMethodCommandRepository } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-payment-method/subscription-payment-method.command.repository';
import { SubscriptionPaymentMethodQueryRepository } from '@modules/platform/subscription/infrastructure/persistence/prisma/repositories/subscription-payment-method/subscription-payment-method.query.repository';

@Module({
  providers: [
    {
      provide: SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
      useClass: SubscriptionPaymentMethodCommandRepository,
    },
    {
      provide: SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY,
      useClass: SubscriptionPaymentMethodQueryRepository,
    },
  ],
  exports: [
    SUBSCRIPTION_PAYMENT_METHOD_COMMAND_REPOSITORY,
    SUBSCRIPTION_PAYMENT_METHOD_QUERY_REPOSITORY,
  ],
})
export class SubscriptionPaymentMethodRepositoryModule {}
