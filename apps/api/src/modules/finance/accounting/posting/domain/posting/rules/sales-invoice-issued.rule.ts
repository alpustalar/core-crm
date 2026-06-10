import { Injectable } from '@nestjs/common';
import { FinancialEventType } from '@prisma/client';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import {
  DraftJournalEntry,
  DraftJournalLine,
  PostingContext,
  PostingRule,
} from '../posting-rule.interface';
import { SalesInvoiceIssuedEventPayload } from '../event-payloads';

/**
 * Satış/Hizmet Faturası (KURUM, normal hasta) — SALES_INVOICE_ISSUED
 *   B 120 Alıcılar (party)      grandTotal
 *     A 600.xx Yurtiçi Satışlar          netTotal
 *     A 391 Hesaplanan KDV               vatTotal
 * (Serbest meslek/stopaj ve sağlık turizmi dalları sonraki fazda — legalType gerekiyor.)
 */
@Injectable()
export class SalesInvoiceIssuedRule implements PostingRule {
  readonly eventType = FinancialEventType.SALES_INVOICE_ISSUED;

  build(event: FinancialEvent, _ctx: PostingContext): DraftJournalEntry {
    const payload = event.payload as unknown as SalesInvoiceIssuedEventPayload;
    const revenueCode = payload.revenueAccountCode ?? '600.01';

    const lines: DraftJournalLine[] = [
      {
        accountCode: '120',
        partyId: payload.partyId,
        debit: payload.grandTotal,
        desc: 'Alıcılar (cari)',
      },
      {
        accountCode: revenueCode,
        credit: payload.netTotal,
        desc: 'Yurtiçi Satışlar',
      },
    ];

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
