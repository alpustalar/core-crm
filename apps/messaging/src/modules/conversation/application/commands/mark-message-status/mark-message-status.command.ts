import { MessageStatus } from '@shared';

/**
 * Giden bir mesajın kanal teslim durumunu günceller (webhook status olayı). externalId
 * ile mesaj bulunur; ileri-yön geçiş idempotenttir. Public webhook akışından dispatch
 * edilir; dönüş void.
 */
export interface MarkMessageStatusPricing {
  /** marketing | utility | authentication | service */
  category?: string | null;
  billable?: boolean | null;
  /** Aktif konuşma penceresi bitiş anı (statuses[].conversation.expiration_timestamp). */
  windowExpiresAt?: Date | null;
}

export class MarkMessageStatusCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      externalId: string;
      status: MessageStatus;
      errorReason?: string | null;
      /** WhatsApp hata kodu (FAILED durumunda; ör. '131047'). */
      errorCode?: string | null;
      /** Konuşma kategorisi/faturalanabilirlik (maliyet takibi). */
      pricing?: MarkMessageStatusPricing;
    }
  ) {}
}
