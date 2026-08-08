import { Module } from '@nestjs/common';
import { PaymentPresentationModule } from './presentation/presentation.module';
import { PaymentInfrastructureModule } from '@modules/finance/payment/infrastructure/infrastructure.module';

@Module({
  imports: [PaymentPresentationModule, PaymentInfrastructureModule],
  exports: [PaymentInfrastructureModule],
})
export class PaymentModule {}
