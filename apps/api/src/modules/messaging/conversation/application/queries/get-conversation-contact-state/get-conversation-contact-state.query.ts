import { IQuery } from '@nestjs/cqrs';
import { MessageChannel } from '@prisma/client';
import { GetConversationContactStateResponse } from './get-conversation-contact-state.response';

/**
 * Bir kontağın (clinicId+channel+contactPhone) yazışmasının var olup olmadığını ve hasta
 * eşleme durumunu döner. Internal: Telegram webhook'u, yeni/misafir konuşmada bir kez
 * contact istemi göndermek için kullanır.
 */
export class GetConversationContactStateQuery implements IQuery {
  readonly __responseType!: GetConversationContactStateResponse;
  constructor(
    public readonly clinicId: string,
    public readonly channel: MessageChannel,
    public readonly contactPhone: string
  ) {}
}
