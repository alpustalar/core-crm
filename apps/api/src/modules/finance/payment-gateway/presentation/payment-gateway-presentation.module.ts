import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { ClinicPaymentGatewayCommandModule } from '@modules/finance/payment-gateway/application/commands/command.module';
import { ClinicPaymentGatewayQueryModule } from '@modules/finance/payment-gateway/application/queries/query.module';

@Module({
  imports: [ClinicPaymentGatewayCommandModule, ClinicPaymentGatewayQueryModule],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayPresentationModule {}
