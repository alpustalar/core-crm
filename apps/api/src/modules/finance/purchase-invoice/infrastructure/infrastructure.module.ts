import { Module } from '@nestjs/common';
import { PurchaseInvoiceRepositoriesModule } from '@modules/finance/purchase-invoice/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PurchaseInvoiceRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class PurchaseInvoiceInfrastructureModule {}
