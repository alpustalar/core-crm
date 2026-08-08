import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayRepositoriesModule } from '@modules/finance/payment-gateway/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [ClinicPaymentGatewayRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ClinicPaymentGatewayInfrastructureModule {}
