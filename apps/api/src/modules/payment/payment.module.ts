import { Module } from '@nestjs/common';
import { PaymentUseCaseModule } from '@modules/payment/application/use-cases/payment-use-case.module';
import { PaymentPresentationModule } from '@modules/payment/presentation/payment-presentation.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { PAYMENT_MODULE_API_TOKEN } from '@modules/payment/domain/interfaces/payment.module.api.interface';
import { PaymentModuleApi } from '@modules/payment/payment.module.api';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.FINANCE }),
    PaymentUseCaseModule,
    PaymentPresentationModule,
  ],
  providers: [
    {
      provide: PAYMENT_MODULE_API_TOKEN,
      useClass: PaymentModuleApi,
    },
  ],
  exports: [PAYMENT_MODULE_API_TOKEN],
})
export class PaymentModule {}
