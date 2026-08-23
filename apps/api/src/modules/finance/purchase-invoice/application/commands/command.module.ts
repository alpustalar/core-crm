import { Module } from '@nestjs/common';
import { RecordPurchaseInvoiceHandler } from './record-purchase-invoice/record-purchase-invoice.handler';
import { MatchPurchaseInvoiceHandler } from './match-purchase-invoice/match-purchase-invoice.handler';
import { UnmatchPurchaseInvoiceHandler } from './unmatch-purchase-invoice/unmatch-purchase-invoice.handler';
import { PurchaseInvoiceInfrastructureModule } from '@modules/finance/purchase-invoice/infrastructure/infrastructure.module';

const CommandHandlers = [
  RecordPurchaseInvoiceHandler,
  MatchPurchaseInvoiceHandler,
  UnmatchPurchaseInvoiceHandler,
];

@Module({
  imports: [PurchaseInvoiceInfrastructureModule],
  providers: [...CommandHandlers],
})
export class PurchaseInvoiceCommandModule {}
