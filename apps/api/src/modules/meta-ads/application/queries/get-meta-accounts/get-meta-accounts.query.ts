import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class GetMetaAccountsQuery implements IQuery {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
  ) {}
}
