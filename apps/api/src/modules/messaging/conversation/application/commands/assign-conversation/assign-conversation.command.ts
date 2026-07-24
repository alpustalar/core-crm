import { IGetContext } from '@common/decorators';

/** Bir yazışmayı bir kullanıcıya atar (status OPEN ise PENDING'e geçer). Dönüş void. */
export class AssignConversationCommand {
  readonly __responseType!: void;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      assigneeUserId: string;
      ctx: IGetContext;
    }
  ) {}
}
