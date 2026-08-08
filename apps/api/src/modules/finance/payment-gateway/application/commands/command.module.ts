import { Module } from '@nestjs/common';
import { RegisterClinicPaymentGatewayHandler } from './register-clinic-payment-gateway/register-clinic-payment-gateway.handler';
import { PosInfrastructureModule } from '@src/infrastructure/payment/pos/pos.infrastructure.module';
import { ClinicPaymentGatewayInfrastructureModule } from '@modules/finance/payment-gateway/infrastructure/infrastructure.module';

const CommandHandlers = [RegisterClinicPaymentGatewayHandler];

@Module({
  imports: [ClinicPaymentGatewayInfrastructureModule, PosInfrastructureModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ClinicPaymentGatewayCommandModule {}
