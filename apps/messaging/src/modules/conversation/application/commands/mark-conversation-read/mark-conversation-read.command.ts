import { IGetContext } from '@common/decorators';

/**
 * Ajan yazışmayı açıp okudu: okunmamış sayacı sıfırlanır ve en güncel gelen mesaj
 * WhatsApp'ta "okundu" (mavi tik) işaretlenir (best-effort). Dönüş void.
 */
export class MarkConversationReadCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      ctx: IGetContext;
    }
  ) {}
}
