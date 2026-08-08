import { Module } from '@nestjs/common';
import { PaymentReportsController } from '@modules/finance/payment/presentation/http/controllers/payment-reports.controller';

@Module({ controllers: [PaymentReportsController] })
export class PaymentPresentationModule {}
