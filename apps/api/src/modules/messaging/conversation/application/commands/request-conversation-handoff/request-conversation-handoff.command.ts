import { IGetContext } from '@common/decorators';

/**
 * AI asistanı (veya sistem) bir yazışmayı insana devreder — belirli kullanıcı atanmaz,
 * status OPEN → PENDING'e geçer. Dönüş void.
 */
export class RequestConversationHandoffCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      ctx: IGetContext;
      reason?: string;
    }
  ) {}
}
