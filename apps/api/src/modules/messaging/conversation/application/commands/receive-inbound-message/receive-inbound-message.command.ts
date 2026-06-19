import { MessageType } from '@prisma/client';

export interface ReceiveInboundMessageInput {
  clinicId: string;
  organizationId: string;
  contactPhone: string;
  contactName?: string | null;
  /** WhatsApp mesaj id'si — idempotency anahtarı. */
  externalId: string;
  type?: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
  occurredAt?: Date;
}

/**
 * Bir kontaktan gelen (inbound) WhatsApp mesajını çekirdeğe işler. Public webhook
 * akışından dispatch edilir (actor context yok); clinicId/organizationId kanal
 * routing'inden gelir. Dönüş: oluşturulan/var olan Message id'si.
 */
export class ReceiveInboundMessageCommand {
  readonly __responseType!: string;
  constructor(public readonly input: ReceiveInboundMessageInput) {}
}
