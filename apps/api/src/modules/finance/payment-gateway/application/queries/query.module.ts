import { Module } from '@nestjs/common';
import { GetClinicPaymentGatewayHandler } from './get-clinic-payment-gateway/get-clinic-payment-gateway.handler';
import { ClinicPaymentGatewayRepositoriesModule } from '@modules/finance/payment-gateway/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetClinicPaymentGatewayHandler];

@Module({
  imports: [ClinicPaymentGatewayRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ClinicPaymentGatewayQueryModule {}
