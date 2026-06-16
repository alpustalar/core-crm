import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicPaymentGatewayHandler } from './get-clinic-payment-gateway/get-clinic-payment-gateway.handler';
import { ClinicPaymentGatewayRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/clinic-payment-gateway/clinic-payment-gateway.repository.module';

const QueryHandlers = [GetClinicPaymentGatewayHandler];

@Module({
  imports: [CqrsModule, ClinicPaymentGatewayRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ClinicPaymentGatewayQueryModule {}
