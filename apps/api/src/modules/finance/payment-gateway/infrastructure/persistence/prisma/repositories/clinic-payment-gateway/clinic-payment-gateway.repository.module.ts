import { Module } from '@nestjs/common';
import {
  CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY,
  CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY,
} from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway.repository';
import { ClinicPaymentGatewayCommandRepository } from './clinic-payment-gateway.command.repository';
import { ClinicPaymentGatewayQueryRepository } from './clinic-payment-gateway.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY,
      useClass: ClinicPaymentGatewayCommandRepository,
    },
    {
      provide: CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY,
      useClass: ClinicPaymentGatewayQueryRepository,
    },
  ],
  exports: [
    CLINIC_PAYMENT_GATEWAY_COMMAND_REPOSITORY,
    CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY,
  ],
})
export class ClinicPaymentGatewayRepositoryModule {}
