import { Module } from '@nestjs/common';
import { PaymentReportsController } from '@modules/finance/payment/presentation/http/controllers/payment-reports.controller';
import { PaymentApplicationModule } from '@modules/finance/payment/application/application.module';

@Module({
  imports: [PaymentApplicationModule],
  controllers: [PaymentReportsController],
})
export class PaymentPresentationModule {}
