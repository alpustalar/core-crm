import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';
import { PaymentGatewayApplicationModule } from '@modules/finance/payment-gateway/application/application.module';

@Module({
  imports: [PaymentGatewayApplicationModule],
  controllers: [PaymentGatewayController],
})
export class PaymentGatewayPresentationModule {}
