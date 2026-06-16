import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterClinicPaymentGatewayHandler } from './register-clinic-payment-gateway/register-clinic-payment-gateway.handler';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { ClinicPaymentGatewayRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/clinic-payment-gateway/clinic-payment-gateway.repository.module';

const CommandHandlers = [RegisterClinicPaymentGatewayHandler];

@Module({
  imports: [
    CqrsModule,
    PolicyModule,
    IyzicoModule,
    ClinicPaymentGatewayRepositoryModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ClinicPaymentGatewayCommandModule {}
