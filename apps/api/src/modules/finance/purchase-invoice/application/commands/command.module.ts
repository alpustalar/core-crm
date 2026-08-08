import { Module } from '@nestjs/common';
import { RecordPurchaseInvoiceHandler } from './record-purchase-invoice/record-purchase-invoice.handler';
import { PurchaseInvoiceInfrastructureModule } from '@modules/finance/purchase-invoice/infrastructure/infrastructure.module';

const CommandHandlers = [RecordPurchaseInvoiceHandler];

@Module({
  imports: [PurchaseInvoiceInfrastructureModule],
  providers: [...CommandHandlers],
})
export class PurchaseInvoiceCommandModule {}
