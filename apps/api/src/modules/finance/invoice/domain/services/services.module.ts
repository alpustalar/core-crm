import { Module } from '@nestjs/common';
import { InvoiceRepositoriesModule } from '@modules/finance/invoice/infrastructure/persistence/prisma/repositories/repositories.module';
import { INVOICE_ISSUANCE_SERVICE } from '@modules/finance/invoice/domain/services/invoice-issuance/invoice-issuance.service.interface';
import { InvoiceIssuanceService } from '@modules/finance/invoice/domain/services/invoice-issuance/invoice-issuance.service';

/**
 * Yaprak modül: yalnız fatura invariant'ını dışarı açar. Tüketiciler (ör.
 * treatment-charge) bu modülü import eder; `InvoiceModule`'ü DEĞİL — o
 * controller'ları ve tüm handler'ları da beraberinde çekerdi.
 */
@Module({
  imports: [InvoiceRepositoriesModule],
  providers: [
    { provide: INVOICE_ISSUANCE_SERVICE, useClass: InvoiceIssuanceService },
  ],
  exports: [INVOICE_ISSUANCE_SERVICE],
})
export class InvoiceDomainServicesModule {}
