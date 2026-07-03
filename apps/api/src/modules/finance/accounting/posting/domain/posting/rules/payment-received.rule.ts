import { Injectable } from '@nestjs/common';
import { FinancialEvent } from '@shared';
import {
  DraftJournalEntry,
  PostingContext,
  PostingRule,
} from '../posting-rule.interface';
import { PaymentReceivedEventPayload } from '../event-payloads';
import { FinancialEventTypeSchema } from '@shared';

/**
 * Tahsilat — PAYMENT_RECEIVED
 *   Nakit:  B 100 Kasa            / A 120 Alıcılar (party)
 *   Banka:  B 102 Bankalar        / A 120 Alıcılar (party)
 *   POS:    B 108 Diğer Hazır Değ. / A 120 Alıcılar (party)
 * (POS komisyon/valör ayrıştırması sonraki fazda.)
 */
@Injectable()
export class PaymentReceivedRule implements PostingRule {
  readonly eventType = FinancialEventTypeSchema.enum.PAYMENT_RECEIVED;

  build(event: FinancialEvent, _ctx: PostingContext): DraftJournalEntry {
    const payload = event.payload as unknown as PaymentReceivedEventPayload;

    const cashAccountCode =
      payload.method === 'CASH'
        ? '100'
        : payload.method === 'POS_CARD'
          ? '108'
          : '102';

    return {
      date: event.occurredAt,
      description: 'Tahsilat',
      // Yabancı para ise posting handler fonksiyonel paraya çevirir (Model A).
      currency: payload.currency,
      lines: [
        {
          accountCode: cashAccountCode,
          debit: payload.amount,
          desc: 'Tahsilat',
        },
        {
          accountCode: '120',
          partyId: payload.partyId,
          credit: payload.amount,
          desc: 'Alıcılar (cari)',
        },
      ],
    };
  }
}
