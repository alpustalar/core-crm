import { IGetContext } from '@common/decorators';

/** Bir yazışmayı kapatır (status CLOSED). Dönüş void. */
export class CloseConversationCommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly conversationId: string,
    public readonly ctx: IGetContext
  ) {}
}
