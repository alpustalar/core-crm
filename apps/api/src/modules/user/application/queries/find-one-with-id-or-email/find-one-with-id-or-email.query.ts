import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindOneWithIdOrEmailQuery {
  constructor(
    public readonly userIdOrEmail: string,
    public readonly context: IGetContext
  ) {}
}
