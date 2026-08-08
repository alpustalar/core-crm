import { IGetContext } from '@common/decorators';

/** Bir yazışmayı kapatır (status CLOSED). Dönüş void. */
export class CloseConversationCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      ctx: IGetContext;
    }
  ) {}
}
