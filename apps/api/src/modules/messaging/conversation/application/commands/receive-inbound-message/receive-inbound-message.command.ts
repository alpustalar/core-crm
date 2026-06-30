import { MessageChannel, MessageType } from '@prisma/client';
import { InboundMessagePayload } from '@modules/messaging/conversation/domain/types/create-message.props';

export interface ReceiveInboundMessageInput {
  /** Hangi kanaldan geldiği; verilmezse WHATSAPP varsayılır (geriye dönük uyumluluk). */
  channel?: MessageChannel;
  clinicId: string;
  organizationId: string;
  /** Kanal-özgü kontak kimliği: WhatsApp E.164 telefon, Telegram chatId. */
  contactPhone: string;
  /**
   * Hasta eşlemesi için kullanılacak GERÇEK telefon. WhatsApp'ta contactPhone zaten
   * telefondur (verilmezse o kullanılır). Telegram'da contactPhone chatId olduğundan
   * eşleme yapılamaz; yalnızca kullanıcı numarasını paylaştığında (request_contact)
   * bu alan dolar ve hasta o telefonla eşlenir.
   */
  matchPhone?: string | null;
  contactName?: string | null;
  /** Kanal sağlayıcısının mesaj id'si — idempotency anahtarı. */
  externalId: string;
  type?: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
  /** interactive/location/contacts/reaction yapısal gövdesi. */
  payload?: InboundMessagePayload | null;
  /** Alıntılanan mesajın wamid'i (context.id). */
  replyToExternalId?: string | null;
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
