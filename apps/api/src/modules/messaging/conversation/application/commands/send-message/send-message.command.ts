import { MessageType } from '@prisma/client';
import { IGetContext } from '@common/decorators';

export interface SendMessageInput {
  conversationId: string;
  type?: MessageType;
  body?: string | null;
  mediaUrl?: string | null;
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
