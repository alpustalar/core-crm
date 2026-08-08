import { Module } from '@nestjs/common';
import { PaymentEventModule } from '@modules/finance/payment/infrastructure/messaging/events/payment-event.module';
import { PaymentRepositoriesModule } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PaymentEventModule, PaymentRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class PaymentInfrastructureModule {}
