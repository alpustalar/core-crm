import { Module } from '@nestjs/common';
import { PurchaseInvoiceRepositoryModule } from '@modules/finance/purchase-invoice/infrastructure/persistence/prisma/repositories/purchase-invoice/purchase-invoice.repository.module';

const PurchaseInvoiceRepositoriesModules = [PurchaseInvoiceRepositoryModule];

@Module({
  imports: [...PurchaseInvoiceRepositoriesModules],
  exports: [...PurchaseInvoiceRepositoriesModules],
})
export class PurchaseInvoiceRepositoriesModule {}
