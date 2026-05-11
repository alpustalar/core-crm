import { Module } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { IyzicoModule } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.module';
import {
  CancelPaymentUseCase,
  HandlePaymentCallbackUseCase,
  InitCheckoutFormUseCase,
  RefundPaymentUseCase,
} from '@modules/payment/application/use-cases/iyzico/commands';
import { GetInstallmentInfoUseCase } from '@modules/payment/application/use-cases/iyzico/queries';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/publisher/payment.publisher';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';

const IyzicoCommandUseCases = [
  InitCheckoutFormUseCase,
  HandlePaymentCallbackUseCase,
  CancelPaymentUseCase,
  RefundPaymentUseCase,
];

const IyzicoQueryUseCases = [GetInstallmentInfoUseCase];

@Module({
  imports: [IyzicoModule],
  providers: [
    ...IyzicoCommandUseCases,
    ...IyzicoQueryUseCases,
    PaymentRepository,
    ContextService,
    PaymentEventPublisher,
    PaymentDomainService,
  ],
  exports: [...IyzicoCommandUseCases, ...IyzicoQueryUseCases],
})
export class PaymentUseCaseModule {}
