import { IGetContext } from '@common/decorators';

/** Bir yazışmayı bir kullanıcıya atar (status OPEN ise PENDING'e geçer). Dönüş void. */
export class AssignConversationCommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly conversationId: string,
    public readonly assigneeUserId: string,
    public readonly ctx: IGetContext
  ) {}
}
