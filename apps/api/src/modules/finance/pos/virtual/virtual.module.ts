import { Module } from '@nestjs/common';
import { PaymentCommandModule } from './application/commands/command.module';
import { PaymentQueryModule } from './application/queries/query.module';
import { PaymentPresentationModule } from './presentation/payment-presentation.module';

@Module({
  imports: [
    PaymentCommandModule,
    PaymentQueryModule,
    PaymentPresentationModule,
  ],
  exports: [PaymentCommandModule, PaymentQueryModule],
})
export class VirtualPosModule {}
