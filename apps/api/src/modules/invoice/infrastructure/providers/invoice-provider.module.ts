import { Module } from '@nestjs/common';
import { INVOICE_PROVIDER } from '@modules/invoice/domain/interfaces/invoice-provider.interface';
import { NullInvoiceProvider } from './null-invoice.provider';

@Module({
  providers: [
    { provide: INVOICE_PROVIDER, useClass: NullInvoiceProvider },
  ],
  exports: [INVOICE_PROVIDER],
})
export class InvoiceProviderModule {}
