import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecordPurchaseInvoiceHandler } from './record-purchase-invoice/record-purchase-invoice.handler';
import { PurchaseInvoiceRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/purchase-invoice/purchase-invoice.repository.module';

const CommandHandlers = [RecordPurchaseInvoiceHandler];

@Module({
  imports: [CqrsModule, PurchaseInvoiceRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PurchaseInvoiceCommandModule {}
