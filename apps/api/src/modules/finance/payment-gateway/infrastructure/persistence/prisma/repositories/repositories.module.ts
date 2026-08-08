import { Module } from '@nestjs/common';
import { ClinicPaymentGatewayRepositoryModule } from '@modules/finance/payment-gateway/infrastructure/persistence/prisma/repositories/clinic-payment-gateway/clinic-payment-gateway.repository.module';

const RepositoriesModules = [ClinicPaymentGatewayRepositoryModule];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class ClinicPaymentGatewayRepositoriesModule {}
