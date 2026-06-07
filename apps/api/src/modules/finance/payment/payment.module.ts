import { PaymentQueryModule } from '@modules/finance/payment/application/queries/query.module';
import { PaymentCommandModule } from '@modules/finance/payment/application/commands/command.module';
import { Module } from '@nestjs/common';
import { PaymentPresentationModule } from '@modules/finance/payment/presentation/payment-presentation.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';

@Module({
  imports: [
    PaymentQueryModule,
    PaymentCommandModule,
    BullModule.registerQueue({ name: QUEUES.FINANCE }),
    PaymentPresentationModule,
  ],
})
export class PaymentModule {}
