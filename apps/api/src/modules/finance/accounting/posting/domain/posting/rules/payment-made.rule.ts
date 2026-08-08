import { Injectable } from '@nestjs/common';
import { FinancialEvent, FinancialEventTypeSchema } from '@shared';
import { ACCOUNTING_RULES } from '@modules/finance/shared/domain/constants/accounting-rules.constant';
import {
  DraftJournalEntry,
  PostingContext,
  PostingRule,
} from '../posting-rule.interface';
import { PaymentMadeEventPayload } from '../event-payloads';

/** Satıcılar — 320 `requiresParty`, cari bazında takip edilir. */
const SUPPLIERS_320 = '320';

/**
 * Satıcıya ödeme — PAYMENT_MADE.
 *   Nakit: B 320 Satıcılar (party) / A 100 Kasa
 *   Banka: B 320 Satıcılar (party) / A 102 Bankalar
 *
 * `PaymentReceivedRule`'un karşı yönüdür. Bu kural olmadan 320'yi **alacaklandıran**
 * kurallar (alış faturası, sağlık turizmi tedarikçi payı) vardı ama borcu
 * **kapatan** hiçbir şey yoktu — satıcı borcu defterde sonsuza dek büyüyordu.
 */
@Injectable()
export class PaymentMadeRule implements PostingRule {
  readonly eventType = FinancialEventTypeSchema.enum.PAYMENT_MADE;

  build(event: FinancialEvent, _ctx: PostingContext): DraftJournalEntry {
    const payload = event.payload as unknown as PaymentMadeEventPayload;

    const fundsAccountCode =
      payload.method === 'CASH'
        ? ACCOUNTING_RULES.TARGET_ACCOUNTS.CASH_100
        : ACCOUNTING_RULES.TARGET_ACCOUNTS.BANKS_102;

    const description = payload.reference
      ? `Satıcı ödemesi (${payload.reference})`
      : 'Satıcı ödemesi';

    return {
      date: event.occurredAt,
      description,
      // Yabancı para ise posting handler fonksiyonel paraya çevirir (Model A).
      currency: payload.currency,
      lines: [
        {
          accountCode: SUPPLIERS_320,
          partyId: payload.partyId,
          debit: payload.amount,
          desc: 'Satıcılar (cari)',
        },
        {
          accountCode: fundsAccountCode,
          credit: payload.amount,
          desc: description,
        },
      ],
    };
  }
}
