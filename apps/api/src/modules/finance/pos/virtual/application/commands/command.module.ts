import { RefundPaymentHandler } from '@modules/finance/pos/virtual/application/commands/iyzico/refund-payment/refund-payment.handler';
import { InitCheckoutFormHandler } from '@modules/finance/pos/virtual/application/commands/iyzico/init-checkout-form/init-checkout-form.handler';
import { HandlePaymentCallbackHandler } from '@modules/finance/pos/virtual/application/commands/iyzico/handle-payment-callback/handle-payment-callback.handler';
import { Module } from '@nestjs/common';
import { CancelPaymentHandler } from '@modules/finance/pos/virtual/application/commands/iyzico/cancel-payment/cancel-payment.handler';
import { PaymentModule } from '@modules/finance/payment/payment.module';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';
import { IyzicoTransactionRepositoryModule } from '@modules/finance/pos/virtual/infrastructure/persistence/prisma/repositories/iyzico-transaction/iyzico-transaction.repository.module';

const CommandHandlers = [
  RefundPaymentHandler,
  InitCheckoutFormHandler,
  HandlePaymentCallbackHandler,
  CancelPaymentHandler,
];

@Module({
  imports: [
    PaymentModule,
    PosInfrastructureModule,
    IyzicoTransactionRepositoryModule,
  ],
  providers: CommandHandlers,
  exports: CommandHandlers,
})
export class VirtualPosCommandModule {}
