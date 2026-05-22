import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindOneWithIdOrEmailQueryResponse } from '@modules/user/application/queries/find-one-with-id-or-email/find-one-with-id-or-email.response';

export class FindOneWithIdOrEmailQuery implements IQuery {
  readonly __responseType!: FindOneWithIdOrEmailQueryResponse;
  constructor(
    public readonly userIdOrEmail: string,
    public readonly ctx: IGetContext
  ) {}
}
