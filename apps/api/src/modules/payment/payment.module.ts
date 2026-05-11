import { Module } from '@nestjs/common';
import { PaymentUseCaseModule } from '@modules/payment/application/use-cases/payment-use-case.module';
import { PaymentPresentationModule } from '@modules/payment/presentation/payment-presentation.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.FINANCE }),
    PaymentUseCaseModule,
    PaymentPresentationModule,
  ],
})
export class PaymentModule {}
