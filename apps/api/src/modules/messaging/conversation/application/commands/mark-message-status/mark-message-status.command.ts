import { MessageStatus } from '@prisma/client';

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
    public readonly externalId: string,
    public readonly status: MessageStatus,
    public readonly errorReason?: string | null,
    /** WhatsApp hata kodu (FAILED durumunda; ör. '131047'). */
    public readonly errorCode?: string | null,
    /** Konuşma kategorisi/faturalanabilirlik (maliyet takibi). */
    public readonly pricing?: MarkMessageStatusPricing
  ) {}
}
