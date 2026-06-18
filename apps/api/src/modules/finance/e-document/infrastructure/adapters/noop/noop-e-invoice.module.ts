import { Module } from '@nestjs/common';
import { E_INVOICE_PORT } from '@modules/finance/e-document/domain/ports/e-invoice.port';
import { NoopEInvoiceAdapter } from './noop-e-invoice.adapter';

/**
 * Entegratör kapalıyken devrede olan adapter bağlaması (doc 07 §1). Gerçek
 * Logo/Nilvera/GİB adapter'ı eklenince bu modül onunla değiştirilir.
 */
@Module({
  providers: [{ provide: E_INVOICE_PORT, useClass: NoopEInvoiceAdapter }],
  exports: [E_INVOICE_PORT],
})
export class NoopEInvoiceModule {}
