import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import {
  PURCHASE_INVOICE_COMMAND_REPOSITORY,
  PURCHASE_INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { PurchaseInvoiceCommandRepository } from './purchase-invoice.command.repository';
import { PurchaseInvoiceQueryRepository } from './purchase-invoice.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PURCHASE_INVOICE_COMMAND_REPOSITORY,
      useClass: PurchaseInvoiceCommandRepository,
    },
    {
      provide: PURCHASE_INVOICE_QUERY_REPOSITORY,
      useClass: PurchaseInvoiceQueryRepository,
    },
  ],
  exports: [
    PURCHASE_INVOICE_COMMAND_REPOSITORY,
    PURCHASE_INVOICE_QUERY_REPOSITORY,
  ],
})
export class PurchaseInvoiceRepositoryModule {}
