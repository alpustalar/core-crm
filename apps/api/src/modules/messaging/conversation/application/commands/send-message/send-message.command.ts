import { MessageType } from '@prisma/client';
import { IGetContext } from '@common/decorators';
import { OutboundMediaType } from '@modules/messaging/conversation/domain/types/create-message.props';

export interface SendMessageInput {
  conversationId: string;
  type?: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
  /** MEDIA gönderiminde alt-tip (image/document/video/audio/sticker). */
  mediaType?: OutboundMediaType | null;
}

/**
 * Bir yazışmaya giden (outbound) mesaj gönderir: Message QUEUED→SENT, kanal portu
 * (şimdilik stub) çağrılır. Dönüş: oluşturulan Message id'si.
 */
export class SendMessageCommand {
  readonly __responseType!: string;
  constructor(
    public readonly clinicId: string,
    public readonly input: SendMessageInput,
    public readonly ctx: IGetContext
  ) {}
}
