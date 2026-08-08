import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment/payment.repository.module';

const RepositoriesModules = [PaymentRepositoryModule];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class PaymentRepositoriesModule {}
