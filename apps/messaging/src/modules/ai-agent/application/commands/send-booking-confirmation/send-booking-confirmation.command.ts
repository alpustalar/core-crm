import { ICommand } from '@nestjs/cqrs';

export interface SendBookingConfirmationInput {
  clinicId: string;
  conversationId: string;
  bookingType: 'HOTEL' | 'TRANSFER';
  /** HotelBeds rezervasyon referansı (müşteriye gösterilir). */
  reference: string;
  /** İnsan-okunur özet (ör. "Otel Bir (2026-07-01 → 2026-07-05)"). */
  summary: string;
}

/**
 * Ödeme onaylanıp rezervasyon oluşunca müşteriye mesajlaşma kanalından onay mesajı gönderir.
 * Pencere içinde (veya Telegram/IG'de) mesaj AI tarafından konuşma dilinde üretilir; WhatsApp
 * 24s penceresi dışında onaylı şablon (HSM) gönderilir. Cross-module: booking-payment confirm
 * handler'ı bu komutu bus ile dispatch eder.
 */
export class SendBookingConfirmationCommand implements ICommand {
  readonly __responseType!: void;
  constructor(public readonly input: SendBookingConfirmationInput) {}
}
