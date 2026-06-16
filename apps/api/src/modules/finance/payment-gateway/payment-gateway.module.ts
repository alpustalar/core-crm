import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayCommandModule } from './application/commands/command.module';
import { ClinicPaymentGatewayQueryModule } from './application/queries/query.module';
import { PaymentGatewayPresentationModule } from './presentation/payment-gateway-presentation.module';

@Module({
  imports: [
    ClinicPaymentGatewayCommandModule,
    ClinicPaymentGatewayQueryModule,
    PaymentGatewayPresentationModule,
  ],
  exports: [ClinicPaymentGatewayCommandModule, ClinicPaymentGatewayQueryModule],
})
export class PaymentGatewayModule {}
