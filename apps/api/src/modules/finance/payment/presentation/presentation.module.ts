import { Module } from '@nestjs/common';
import { PaymentReportsQueryController } from '@modules/finance/payment/presentation/http/controllers/payment-reports.query.controller';

@Module({ controllers: [PaymentReportsQueryController] })
export class PaymentPresentationModule {}
