import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayCommandModule } from '@modules/finance/payment-gateway/application/commands/command.module';
import { ClinicPaymentGatewayQueryModule } from '@modules/finance/payment-gateway/application/queries/query.module';

const ApplicationModules = [
  ClinicPaymentGatewayCommandModule,
  ClinicPaymentGatewayQueryModule,
];

@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ClinicPaymentGatewayApplicationModule {}
