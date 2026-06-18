import { Module } from '@nestjs/common';
import { PaymentCommandRepository } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.command.repository';
import {
  PAYMENT_COMMAND_REPOSITORY,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { PaymentQueryRepository } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.query.repository';

@Module({
  providers: [
    { provide: PAYMENT_COMMAND_REPOSITORY, useClass: PaymentCommandRepository },
    { provide: PAYMENT_QUERY_REPOSITORY, useClass: PaymentQueryRepository },
  ],
  exports: [PAYMENT_COMMAND_REPOSITORY, PAYMENT_QUERY_REPOSITORY],
})
export class PaymentRepositoryModule {}
