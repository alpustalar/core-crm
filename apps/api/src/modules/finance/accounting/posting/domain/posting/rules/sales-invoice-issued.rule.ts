import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import {
  DraftJournalEntry,
  DraftJournalLine,
  PostingContext,
  PostingRule,
} from '../posting-rule.interface';
import { SalesInvoiceIssuedEventPayload } from '../event-payloads';
import { FinancialEventTypeSchema } from '@shared';

/**
 * Satış/Hizmet Faturası — SALES_INVOICE_ISSUED
 *
 * KURUM (poliklinik) / nihai tüketici hasta:
 *   B 120 Alıcılar (party)      grandTotal
 *     A 600.xx Yurtiçi Satışlar          netTotal
 *     A 391 Hesaplanan KDV               vatTotal
 *
 * SERBEST MESLEK (muayenehane, e-SMM), ödeyen vergi sorumlusuysa (payload.withholdingTotal > 0):
 *   B 120 Alıcılar (party)         grandTotal − withholdingTotal   (tahsil edilecek)
 *   B 193 Peşin Ödenen Vergiler    withholdingTotal                (GV stopaj mahsubu)
 *     A 600 Serbest Meslek Hasılatı       netTotal
 *     A 391 Hesaplanan KDV                vatTotal
 *
 * Stopaj kararı (legalType + ödeyenin vergi sorumlusu olması) köprüde verilir; kural
 * payload-driven'dır. Nihai tüketici hastada withholdingTotal=0 → KURUM dalıyla aynı fiş.
 */
@Injectable()
export class SalesInvoiceIssuedRule implements PostingRule {
  readonly eventType = FinancialEventTypeSchema.enum.SALES_INVOICE_ISSUED;

  build(event: FinancialEvent, _ctx: PostingContext): DraftJournalEntry {
    const payload = event.payload as unknown as SalesInvoiceIssuedEventPayload;
    const revenueCode = payload.revenueAccountCode ?? '600.01';
    const withholding = new Decimal(payload.withholdingTotal ?? '0');
    const hasWithholding = withholding.gt(0);

    const receivable = hasWithholding
      ? new Decimal(payload.grandTotal).minus(withholding).toFixed(2)
      : payload.grandTotal;

    const lines: DraftJournalLine[] = [
      {
        accountCode: '120',
        partyId: payload.partyId,
        debit: receivable,
        desc: 'Alıcılar (cari)',
      },
    ];

    if (hasWithholding) {
      lines.push({
        accountCode: '193',
        debit: withholding.toFixed(2),
        desc: 'Peşin Ödenen Vergiler (GV stopajı)',
      });
    }

    lines.push({
      accountCode: revenueCode,
      credit: payload.netTotal,
      desc: 'Yurtiçi Satışlar',
    });

    if (Number(payload.vatTotal) > 0) {
      lines.push({
        accountCode: '391',
        credit: payload.vatTotal,
        desc: 'Hesaplanan KDV',
      });
    }

    return {
      date: event.occurredAt,
      description: 'Satış faturası',
      lines,
    };
  }
}
