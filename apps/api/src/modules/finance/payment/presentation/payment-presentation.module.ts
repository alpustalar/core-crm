import { Module } from '@nestjs/common';
import { PaymentReportsController } from './controllers/payment-reports.controller';
import { PaymentQueryModule } from '@modules/finance/payment/application/queries/query.module';

@Module({
  imports: [PaymentQueryModule],
  controllers: [PaymentReportsController],
})
export class PaymentPresentationModule {}
