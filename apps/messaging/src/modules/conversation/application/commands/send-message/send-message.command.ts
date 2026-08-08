import { MessageType } from '@shared';
import { IGetContext } from '@common/decorators';
import { OutboundMediaType } from '@modules/conversation/domain/contracts/message.contracts';

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
    public readonly payload: {
      clinicId: string;
      input: SendMessageInput;
      ctx: IGetContext;
    }
  ) {}
}
