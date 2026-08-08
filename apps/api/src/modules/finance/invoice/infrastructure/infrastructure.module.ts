import { Module } from '@nestjs/common';
import { InvoiceRepositoriesModule } from '@modules/finance/invoice/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [InvoiceRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class InvoiceInfrastructureModule {}
